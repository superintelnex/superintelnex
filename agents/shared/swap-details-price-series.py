#!/usr/bin/env python3
# DESIGNER NIGHT-RESEARCH: SWAP-DETAILS -> Kurs-Zeitreihe (ausgefuehrter Grenzpreis)
# Quells: token/result/SWAP-DETAILS-*.txt (491 Belege, gitignored). Liefert eine
# committable CSV-Zeitreihe des AUSGEEFUHRTEN Marginalpreises (Beobachtung, kein
# Prognose — Team-Kanon: Beleg, nicht Garantie).
#
# Ausfuehrungs-Bezug pro Beleg:
#   BUY (SOL->SIN):  inSol (human) + expectedOutSinRaw -> SIN pro SOL
#   SELL(SIN->SOL):  amountInSinRaw + expectedOutSolRaw -> SIN pro SOL (invertiert)
# Einheit: SIN pro 1 SOL (Human-SIN = raw/1e5, Human-SOL = raw/1e9).
#
# Aufruf: python3 agents/shared/swap-details-price-series.py
#        (Default-Quellverzeichnis token/result, Default-Ausgabe agents/berichte/pool-snapshots/swap-price-series.csv)

import json, glob, os, sys

ROOT = "/Users/haqmal/Desktop/Projekte/SuperIntelNex"
SRC = os.path.join(ROOT, "token", "result")
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    ROOT, "agents", "berichte", "pool-snapshots", "swap-price-series.csv"
)

DEC_SIN = 5   # token.json (SIN, 5 dez)
DEC_SOL = 9   # SOL lamport

rows = []
buy_n = sell_n = skip = 0
for f in sorted(glob.glob(os.path.join(SRC, "SWAP-DETAILS-*.txt"))):
    try:
        d = json.load(open(f))
    except Exception:
        skip += 1
        continue
    t = d.get("zeit") or os.path.basename(f)
    if "amountInSinRaw" in d and "expectedOutSolRaw" in d:
        in_sin_raw = int(d["amountInSinRaw"]); out_sol_raw = int(d["expectedOutSolRaw"])
        if out_sol_raw <= 0:
            skip += 1; continue
        sin_per_sol = (in_sin_raw / (10 ** DEC_SIN)) / (out_sol_raw / (10 ** DEC_SOL))
        rows.append((t, "SELL", sin_per_sol, in_sin_raw, out_sol_raw, d.get("cuUsed"), d.get("signature")))
        sell_n += 1
    elif "inputSol" in d and "expectedOutSinRaw" in d:
        in_sol = float(d["inputSol"]); out_sin_raw = int(d["expectedOutSinRaw"])
        if in_sol <= 0:
            skip += 1; continue
        sin_per_sol = out_sin_raw / (10 ** DEC_SIN) / in_sol
        rows.append((t, "BUY", sin_per_sol, out_sin_raw, int(in_sol * 10 ** DEC_SOL), d.get("cuUsed"), d.get("signature")))
        buy_n += 1
    else:
        skip += 1

rows.sort(key=lambda r: r[0])
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as o:
    o.write("ts;direction;price_sin_per_sol;in_sin_raw;in_sol_lamports;cu_used;signature\n")
    for r in rows:
        o.write(f"{r[0]};{r[1]};{r[2]:.10f};{r[3]};{r[4]};{r[5]};{r[6]}\n")

# Statistik-Block (Beleg-Zusammenfassung, kein Kurs-Statement):
n = len(rows)
print(f"SWAP-DETAILS: {n} gueltig ({buy_n} BUY, {sell_n} SELL), {skip} ueber-sprungen, -> {OUT}")
if n:
    vals = [r[2] for r in rows]
    print(f"  SIN/SOL-Breite: min={min(vals):.6f} max={max(vals):.6f} median={sorted(vals)[n//2]:.6f}")
    t0, t1 = rows[0][0], rows[-1][0]
    print(f"  Zeitraum: {t0} .. {t1}")
    print("  neuste 5 Belege:")
    for r in rows[-5:]:
        print(f"    {r[0]} [{r[1]:4}] {r[2]:.6f} SIN/SOL")
