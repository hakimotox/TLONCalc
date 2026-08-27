# ⚔️ T
```

net_crit = max(крит - иммунитет_к_криту, 0)
net_block = max(блок_противника - уничтожение, 0)

total = net_crit + net_block

if total <= 100:
final_crit = net_crit
final_block = net_block
final_normal = 100 - total
else:
final_crit = net_crit / total * 100
final_block = net_block / total * 100
final_normal = 0

final_crit_dmg = max(150 + УРН_крита - снижение_УРН_крита, 150)
final_block_dmg = max(50 - снижение_УРН_блока, 0)

```

## 🚀 Использование

1. Введите значения ста
