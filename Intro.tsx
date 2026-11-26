import { useEffect, useState } from "react";
import { Pet } from "../Pet";

/** Cena de 3s: DroidNy entra na sala branca, tira o controle de trás e acena com ele na mão. */
export function Intro() {
  const [ph, setPh] = useState(0);
  useEffect(() => {
    const ts = [30, 1000, 1500].map((ms, i) => setTimeout(() => setPh(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <div className="absolute inset-0" aria-label="Abrindo Divertir">
      <div className="absolute inset-x-0 bottom-[30%] h-px bg-border" />
      <div className="absolute bottom-[30%] left-[calc(50%-5rem)] w-40 ease-emph"
        style={{ aspectRatio: "200 / 230", transform: ph === 0 ? "translateX(-160%)" : "none", transition: "transform 1000ms var(--ease-emph)" }}>
        <Pet pose={ph < 2 ? "walk" : "stand"} mood={ph >= 3 ? "happy" : "idle"} dirt={0} emote={ph >= 3 ? "wave" : null} gamepad={ph >= 2} />
      </div>
    </div>
  );
}
