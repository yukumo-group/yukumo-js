import { useState, useEffect, useMemo } from "react";
import "./App.css";
import {
  AquesTalk1,
  AquesTalk2,
  load,
  loadAquesTalk2,
  Voice,
  AquesTalk2Voice,
} from "yukumo.js";
import type { Kanji2Koe } from "kanji2koe-openjtalk";
import { generateDevKey } from "./kg.ts";
import kanji2koeWasmUrl from "../node_modules/kanji2koe-openjtalk/pkg/aqkanji2koe_wasm_bg.wasm?url";

async function play_wav(wav: Uint8Array) {
  const blob = new Blob([new Uint8Array(wav)], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await audio.play();
  URL.revokeObjectURL(url);
}

type EngineId = "aq1" | "aq2";
type TalkEngine = AquesTalk1 | AquesTalk2;

const ENGINES: { id: EngineId; label: string }[] = [
  { id: "aq1", label: "AquesTalk1" },
  { id: "aq2", label: "AquesTalk2" },
];

const AQ1_VOICES: { id: Voice; label: string }[] = [
  { id: "f1", label: "女声1 (f1)" },
  { id: "f2", label: "女声2 (f2)" },
  { id: "imd1", label: "中性 (imd1)" },
  { id: "m1", label: "男声1 (m1)" },
  { id: "m2", label: "男声2 (m2)" },
  { id: "jgr", label: "機械1 (jgr)" },
  { id: "dvd", label: "機械2 (dvd)" },
  { id: "r1", label: "ロボット (r1)" },
];

const AQ2_VOICES: { id: AquesTalk2Voice; label: string }[] = [
  { id: "f1c", label: "女声 (f1c)" },
  { id: "f3a", label: "女声 (f3a)" },
  { id: "f4", label: "女声 (f4)" },
  { id: "mf1", label: "中性 (mf1)" },
  { id: "mf2", label: "中性 (mf2)" },
  { id: "m4b", label: "男声 (m4b)" },
  { id: "m5", label: "男声 (m5)" },
  { id: "rm", label: "男声 (rm)" },
  { id: "rm3", label: "男声 (rm3)" },
  { id: "huskey", label: "ハスキー (huskey)" },
  { id: "rb2", label: "ロボット (rb2)" },
  { id: "rb3", label: "ロボット (rb3)" },
  { id: "robo", label: "ロボット (robo)" },
  { id: "yukkuri", label: "ゆっくり (yukkuri)" },
];

const MEMORY_SIZE = 1024 * 1024 * 1024; // 1GB

function App() {
  const [talkText, setTalkText] = useState("こんにちわ、せかい");
  const [engineId, setEngineId] = useState<EngineId>("aq1");
  const [selectedVoice, setSelectedVoice] = useState<Voice | AquesTalk2Voice>(
    AQ1_VOICES[0].id
  );
  const [speed, setSpeed] = useState(100);
  const [talkEngine, setTalkEngine] = useState<TalkEngine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [convertKanji, setConvertKanji] = useState(false);
  const [kanji2koe, setKanji2Koe] = useState<Kanji2Koe | null>(null);
  const [isConverterLoading, setIsConverterLoading] = useState(false);

  const voices = engineId === "aq1" ? AQ1_VOICES : AQ2_VOICES;

  useEffect(() => {
    let cancelled = false;
    let engine: TalkEngine | null = null;
    (async () => {
      setIsLoading(true);
      setTalkEngine(null);
      try {
        if (engineId === "aq1") {
          const aq1 = await load(selectedVoice as Voice, {
            memorySize: MEMORY_SIZE,
          });
          const keyResult = aq1.SetDevKey(generateDevKey());
          if (keyResult !== 0) {
            throw new Error(`SetDevKey failed with code ${keyResult}`);
          }
          engine = aq1;
        } else {
          engine = await loadAquesTalk2(selectedVoice as AquesTalk2Voice, {
            memorySize: MEMORY_SIZE,
          });
        }
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
  }, [engineId, selectedVoice]);

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
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="engine-select" style={{ marginRight: "0.5rem" }}>
            Engine:
          </label>
          <select
            id="engine-select"
            value={engineId}
            onChange={(e) => {
              const next = e.target.value as EngineId;
              setEngineId(next);
              setSelectedVoice(
                next === "aq1" ? AQ1_VOICES[0].id : AQ2_VOICES[0].id
              );
            }}
            disabled={isLoading}
          >
            {ENGINES.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="voice-select" style={{ marginRight: "0.5rem" }}>
            Voice:
          </label>
          <select
            id="voice-select"
            value={selectedVoice}
            onChange={(e) => {
              setSelectedVoice(e.target.value as Voice | AquesTalk2Voice);
            }}
            disabled={isLoading}
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="speed-input" style={{ marginRight: "0.5rem" }}>
            Speed:
          </label>
          <input
            id="speed-input"
            type="number"
            min="50"
            max="300"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value) || 100)}
            style={{ width: "60px", marginRight: "1rem" }}
          />
          <input
            type="range"
            min="50"
            max="300"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            style={{ verticalAlign: "middle" }}
          />
          <span style={{ marginLeft: "0.5rem" }}>{speed}</span>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="convert-kanji" style={{ cursor: "pointer" }}>
            <input
              id="convert-kanji"
              type="checkbox"
              checked={convertKanji}
              onChange={(e) => setConvertKanji(e.target.checked)}
              disabled={isConverterLoading}
              style={{ marginRight: "0.5rem", verticalAlign: "middle" }}
            />
            漢字変換 (kanji2koe-openjtalk)
          </label>
          {isConverterLoading && (
            <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", color: "#888" }}>
              変換器を読み込み中...
            </span>
          )}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <textarea
            style={{
              boxSizing: "border-box",
              width: "100%",
              height: "100px",
              padding: "0.5rem",
            }}
            value={talkText}
            onChange={(e) => setTalkText(e.target.value)}
            placeholder={
              convertKanji
                ? "漢字かな交じり文を入力..."
                : "喋らせたい文字を入力..."
            }
          />
          {convertedKoe != null && (
            <p
              style={{
                boxSizing: "border-box",
                width: "100%",
                margin: "0.5rem 0 0",
                padding: "0.5rem",
                textAlign: "left",
                fontSize: "0.85rem",
                color: "#888",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {convertedKoe}
            </p>
          )}
        </div>
        <button
          disabled={playDisabled}
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
              play_wav(await talkEngine.run(koe, speed));
            } catch (e) {
              console.error(e);
              alert(e);
            }
            console.timeEnd("talkEngine.run");
          }}
        >
          {isLoading || isConverterLoading ? "Loading..." : "PLAY!"}
        </button>
        <div style={{ marginTop: "2rem", fontSize: "0.8rem", color: "#666" }}>
          <p>AquesTalkを使用しています</p>
          <p>AquesTalkの著作権は株式会社アクエストに帰属します。</p>
          <p>
            漢字変換には{" "}
            <a
              href="https://github.com/y52en/AqKanji2Koe-OpenJTalk-WASM"
              target="_blank"
              rel="noreferrer"
            >
              kanji2koe-openjtalk
            </a>{" "}
            を使用しています（AqKanji2Koe とは無関係の再実装です）。
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
