# HL Dashboard (Hyperliquid)

Website com:
- Registo/Login (email + password)
- Configuração de um **Hyperliquid public address**
- Fetch de **fills/trades**, fees e estado via `POST https://api.hyperliquid.xyz/info`
- Dashboard com KPIs + gráficos
- Página Trades com filtros

## Como correr em Docker (porta 5555)

```bash
docker compose up -d --build
```

Abre:
- http://localhost:5555

A DB (SQLite) fica em `./data/db.sqlite`.

## Como correr local (sem docker)

```bash
npm install
cp .env.example .env
npm run prisma:push
npm run dev
```

## Nota sobre a API

Este projecto usa o **Info Endpoint** da Hyperliquid (público) para buscar:
- `type: userFillsByTime` (trades/fills)
- `type: userFees`
- `type: clearinghouseState`

Limites e paginação: as respostas com time range podem ser limitadas (ex: 2000 fills por resposta), e a documentação recomenda paginar usando o último `time` como próximo `startTime`.
