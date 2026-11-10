#!/bin/zsh
# CIO-RugCheck-Rescore (read-only) — nach agent-1-Burn-Tx laufen lassen:
#   zsh agents/shared/cio-rescore.sh
# Ergebnis: Score + Risk-Auflistung + LP-Unlocked-Flag (YES/NO).
# Flag=NO → Burn on-chain sichtbar → Outbox rescore-postburn.md füllen.
MINT="A4WSPbHPGuixyAZhtJmUHjpPqq9CnAmEQ1MWQks4A44Z"
BASELINE="Pre-Burn-Baseline 09:32 UTC: Score 67 (raw 33.998), 6 Risks"
echo "=== CIO-RugCheck-Rescore $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
echo "Baseline: $BASELINE"
curl -s "https://api.rugcheck.xyz/v1/tokens/$MINT/report" -o /tmp/rc-rescore.json && python3 - <<'PY'
import json
d=json.load(open('/tmp/rc-rescore.json'))
print(f"score_normalised: {d.get('score_normalised')}  raw: {d.get('score')}  risks: {d.get('risks')}")
names=[r['name'] for r in d.get('risks',[])]
lp_unlocked=any('Unlocked' in n for n in names)
print(f"lp_unlocked_flag: {'YES (PRE-BURN)' if lp_unlocked else 'NO (POST-BURN sichtbar)'}")
for r in d.get('risks',[]):
    print(f"  [{r['level']}] {r['name'][:50]} val={r.get('value','')} pts={r.get('score')}")
PY
