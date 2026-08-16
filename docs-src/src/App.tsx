import { useState, useEffect, useMemo } from "react";
import "./App.css";
import type { Kanji2Koe } from "kanji2koe-openjtalk";
import kanji2koeWasmUrl from "../node_modules/kanji2koe-openjtalk/pkg/aqkanji2koe_wasm_bg.wasm?url";
import { playWav } from "./audio.ts";
import {
  aq10PresetParams,
  defaultVoice,
  isAq10Preset,
  loadTalkEngine,
  synthesize,
  type AnyVoice,
  type EngineId,
  type TalkEngine,
} from "./engines.ts";
import { EngineSelect } from "./components/EngineSelect.tsx";
import { VoiceSelect } from "./components/VoiceSelect.tsx";
import { SpeedControl } from "./components/SpeedControl.tsx";
import { Aq10VoiceParams } from "./components/Aq10VoiceParams.tsx";
import { KanjiToggle } from "./components/KanjiToggle.tsx";
import { TalkInput } from "./components/TalkInput.tsx";
import { PlayButton } from "./components/PlayButton.tsx";
import { LicenseNotice } from "./components/LicenseNotice.tsx";
import type { AqtkVoice } from "yukumo.js";

function App() {
  const [talkText, setTalkText] = useState("こんにちわ、せかい");
  const [engineId, setEngineId] = useState<EngineId>("aq1");
  const [selectedVoice, setSelectedVoice] = useState<AnyVoice>(defaultVoice("aq1"));
  const [speed, setSpeed] = useState(100);
  const [aq10Params, setAq10Params] = useState<AqtkVoice>(aq10PresetParams("f1"));
  const [talkEngine, setTalkEngine] = useState<TalkEngine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [convertKanji, setConvertKanji] = useState(true);
  const [kanji2koe, setKanji2Koe] = useState<Kanji2Koe | null>(null);
  const [isConverterLoading, setIsConverterLoading] = useState(false);

  const voiceForLoad = engineId === "aq10" ? defaultVoice("aq10") : selectedVoice;

  useEffect(() => {
    let cancelled = false;
    let engine: TalkEngine | null = null;
    (async () => {
      setIsLoading(true);
      setTalkEngine(null);
      try {
        engine = await loadTalkEngine(engineId, voiceForLoad);
        if (cancelled) {
          await engine.destroy();
          return;
        }
        setTalkEngine(engine);
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          alert(`Failed to load engine: ${e}`);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (engine) {
        engine.destroy();
      }
    };
  }, [engineId, voiceForLoad]);

  useEffect(() => {
    if (!convertKanji || kanji2koe != null) {
      return;
    }
    let cancelled = false;
    (async () => {
      setIsConverterLoading(true);
      try {
        const { load: loadKanji2Koe } = await import("kanji2koe-openjtalk");
        const converter = await loadKanji2Koe({ wasmPath: kanji2koeWasmUrl });
        if (!cancelled) {
          setKanji2Koe(converter);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          alert(`Failed to load kanji2koe-openjtalk: ${e}`);
          setConvertKanji(false);
        }
      } finally {
        if (!cancelled) {
          setIsConverterLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [convertKanji, kanji2koe]);

  const converterBusy = convertKanji && (isConverterLoading || kanji2koe == null);
  const playDisabled = talkEngine == null || isLoading || converterBusy;
  const convertedKoe = useMemo(() => {
    if (!convertKanji || kanji2koe == null) {
      return null;
    }
    try {
      return kanji2koe.convert(talkText);
    } catch {
      return null;
    }
  }, [convertKanji, kanji2koe, talkText]);

  return (
    <>
      <h1>yukumo.js Demo</h1>
      <div className="card">
        <EngineSelect
          value={engineId}
          disabled={isLoading}
          onChange={(next) => {
            setEngineId(next);
            const voice = defaultVoice(next);
            setSelectedVoice(voice);
            if (next === "aq10" && isAq10Preset(voice)) {
              setAq10Params(aq10PresetParams(voice));
            } else if (engineId === "aq10") {
              setSpeed(aq10Params.spd);
            }
          }}
        />
        <VoiceSelect
          engineId={engineId}
          value={selectedVoice}
          disabled={isLoading && engineId !== "aq10"}
          onChange={(voice) => {
            setSelectedVoice(voice);
            if (engineId === "aq10" && isAq10Preset(voice)) {
              setAq10Params(aq10PresetParams(voice));
            }
          }}
        />
        {engineId === "aq10" ? (
          <Aq10VoiceParams
            value={aq10Params}
            onChange={(next) => {
              setAq10Params(next);
              setSelectedVoice("custom");
            }}
          />
        ) : (
          <SpeedControl value={speed} onChange={setSpeed} />
        )}
        <KanjiToggle
          checked={convertKanji}
          disabled={isConverterLoading}
          loading={isConverterLoading}
          onChange={setConvertKanji}
        />
        <TalkInput
          value={talkText}
          convertedKoe={convertedKoe}
          convertKanji={convertKanji}
          onChange={setTalkText}
        />
        <PlayButton
          disabled={playDisabled}
          loading={isLoading || isConverterLoading}
          onClick={async () => {
            if (talkEngine == null) {
              console.error("talkEngine is null");
              return;
            }
            let koe = talkText;
            if (convertKanji) {
              if (kanji2koe == null) {
                console.error("kanji2koe is null");
                return;
              }
              try {
                koe = kanji2koe.convert(talkText);
              } catch (e) {
                console.error(e);
                alert(e);
                return;
              }
            }
            console.time("talkEngine.run");
            try {
              await playWav(
                synthesize(talkEngine, engineId, selectedVoice, koe, speed, aq10Params)
              );
            } catch (e) {
              console.error(e);
              alert(e);
            }
            console.timeEnd("talkEngine.run");
          }}
        />
        <LicenseNotice />
      </div>
    </>
  );
}

export default App;
