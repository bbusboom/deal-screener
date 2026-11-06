# Math accuracy test

`hand_check.py` rebuilds the Practice deal (Maple Court) from scratch in Python, with no code shared with the site.
`site_check.mts` runs the same deal through the site's model (`src/lib/model.ts`).

```
python3 tests/hand_check.py
npx tsx tests/site_check.mts
```

Result on Nov 6, 2026: both print NOI 179,101, DS 164,591, DSCR 1.088, cap 5.78%, CoC 1.46%, IRR 6.63%, EM 1.53.
