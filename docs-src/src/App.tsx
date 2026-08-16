import { useState, useEffect, useMemo, useRef } from "react";
import "./App.css";
import type { Kanji2Koe } from "kanji2koe-openjtalk";
import kanji2koeWasmUrl from "../node_modules/kanji2koe-openjtalk/pkg/aqkanji2koe_wasm_bg.wasm?url";
import { createPlayback, downloadWav, wavFilename } from "./audio.ts";
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
import {
  ConvertModeSelect,
  type ConvertMode,
} from "./components/ConvertModeSelect.tsx";
import { TalkInput } from "./components/TalkInput.tsx";
import { AudioActions } from "./components/AudioActions.tsx";
import { LicenseNotice } from "./components/LicenseNotice.tsx";
import type { AqtkVoice } from "yukumo.js";
import { chineseToKoe } from "yukumo.js/lang/zh";

function App() {
  const [talkText, setTalkText] = useState("こんにちわ、せかい");
  const [engineId, setEngineId] = useState<EngineId>("aq1");
  const [selectedVoice, setSelectedVoice] = useState<AnyVoice>(defaultVoice("aq1"));
  const [speed, setSpeed] = useState(100);
  const [aq10Params, setAq10Params] = useState<AqtkVoice>(aq10PresetParams("f1"));
  const [talkEngine, setTalkEngine] = useState<TalkEngine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [convertMode, setConvertMode] = useState<ConvertMode>("ja");
  const [kanji2koe, setKanji2Koe] = useState<Kanji2Koe | null>(null);
  const [isConverterLoading, setIsConverterLoading] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const stopPlaybackRef = useRef<(() => void) | null>(null);

  const stopPlayback = () => {
    stopPlaybackRef.current?.();
    stopPlaybackRef.current = null;
    setIsPlaying(false);
  };

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
      stopPlaybackRef.current?.();
      stopPlaybackRef.current = null;
      if (engine) {
        engine.destroy();
      }
    };
  }, [engineId, voiceForLoad]);

  useEffect(() => {
    if (convertMode !== "ja" || kanji2koe != null) {
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
          setConvertMode("none");
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
  }, [convertMode, kanji2koe]);

  const converterBusy =
    convertMode === "ja" && (isConverterLoading || kanji2koe == null);
  const playDisabled = talkEngine == null || isLoading || converterBusy;
  const convertedKoe = useMemo(() => {
    try {
      if (convertMode === "ja") {
        return kanji2koe == null ? null : kanji2koe.convert(talkText);
      }
      if (convertMode === "zh") {
        return chineseToKoe(talkText);
      }
    } catch {
      return null;
    }
    return null;
  }, [convertMode, kanji2koe, talkText]);

  const makeWav = (): Uint8Array | null => {
    if (talkEngine == null) {
      return null;
    }
    let koe = talkText;
    if (convertMode === "ja") {
      if (kanji2koe == null) {
        return null;
      }
      koe = kanji2koe.convert(talkText);
    } else if (convertMode === "zh") {
      koe = chineseToKoe(talkText);
    }
    return synthesize(
      talkEngine,
      engineId,
      selectedVoice,
      koe,
      speed,
      aq10Params
    );
  };

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
        <ConvertModeSelect
          value={convertMode}
          disabled={false}
          loading={convertMode === "ja" && isConverterLoading}
          onChange={setConvertMode}
        />
        <TalkInput
          value={talkText}
          convertedKoe={convertedKoe}
          convertMode={convertMode}
          onChange={setTalkText}
        />
        <AudioActions
          loading={isLoading || converterBusy}
          playDisabled={playDisabled}
          stopDisabled={!isPlaying}
          downloadDisabled={playDisabled}
          onPlay={async () => {
            console.time("talkEngine.run");
            try {
              const wav = makeWav();
              if (wav == null) {
                return;
              }
              stopPlayback();
              const playback = createPlayback(wav, () => {
                stopPlaybackRef.current = null;
                setIsPlaying(false);
              });
              stopPlaybackRef.current = playback.stop;
              setIsPlaying(true);
              await playback.audio.play();
            } catch (e) {
              stopPlayback();
              console.error(e);
              alert(e);
            }
            console.timeEnd("talkEngine.run");
          }}
          onStop={stopPlayback}
          onDownload={() => {
            try {
              const wav = makeWav();
              if (wav == null) {
                return;
              }
              downloadWav(wav, wavFilename(talkText));
            } catch (e) {
              console.error(e);
              alert(e);
            }
          }}
        />
        <LicenseNotice />
      </div>
    </>
  );
}

export default App;
