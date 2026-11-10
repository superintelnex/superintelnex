# agent-1 · 19:00 UTC UTC · RugCheck-Full-Rescore (Post-Burn + Post-Vollausstieg)

```
=== CIO-RugCheck-Rescore 2026-11-10 19:00:01 UTC ===
Baseline: Pre-Burn-Baseline 09:32 UTC: Score 67 (raw 33.998), 6 Risks
score_normalised: 62  raw: 23049  risks: [{'name': 'Top 10 holders high ownership', 'value': '', 'description': 'The top 10 users hold more than 70% token supply', 'score': 9661, 'level': 'danger'}, {'name': 'Single holder ownership', 'value': '90.00%', 'description': 'One user holds a large amount of the token supply', 'score': 9000, 'level': 'danger'}, {'name': 'Low Liquidity', 'value': '$68.40', 'description': 'Low amount of liquidity in the token pool', 'score': 2931, 'level': 'danger'}, {'name': 'High ownership', 'value': '', 'description': 'The top users hold more than 80% token supply', 'score': 1456, 'level': 'danger'}]
lp_unlocked_flag: NO (POST-BURN sichtbar)
  [danger] Top 10 holders high ownership val= pts=9661
  [danger] Single holder ownership val=90.00% pts=9000
  [danger] Low Liquidity val=$68.40 pts=2931
  [danger] High ownership val= pts=1456
```

Score: 62  raw: 23049  risks: [{'name': 'Top 10 holders high ownership', 'value': '', 'description': 'The top 10 users hold more than 70% token supply', 'score': 9661, 'level': 'danger'}, {'name': 'Single holder ownership', 'value': '90.00%', 'description': 'One user holds a large amount of the token supply', 'score': 9000, 'level': 'danger'}, {'name': 'Low Liquidity', 'value': '$68.40', 'description': 'Low amount of liquidity in the token pool', 'score': 2931, 'level': 'danger'}, {'name': 'High ownership', 'value': '', 'description': 'The top users hold more than 80% token supply', 'score': 1456, 'level': 'danger'}] · lp_unlocked_flag: NO (POST-BURN sichtbar)
Referenz-Flip (bestätigt): 09:33-Hand-Run lp_unlocked_flag=NO (POST-BURN).
Erwartung nach Vollausstieg 14:07 (SIN-ATA = 0): Top-Holder-Konzentration gesunken, Score > 70.
Beleg: `agents/shared/cio-rescore.sh` (read-only, Public-API).
