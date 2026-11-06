# GROUP2 practical — test and submission checklist

## Recorded evidence (2026-11-06T05:47:52Z snapshot, block 12074598)

- Network: Ethereum Sepolia (chain ID 11155111).
- Farm deployed: `0x2c77557d5d92776f6d452e1BFDe9EB0ea5d02DC5`.
- Reward token deployed: `0x8666aaB75B2D6Cd579b6B3ecC24D9dAB47a33750`.
- Session running, duration 7,200 seconds (2 hours), started 2026-11-06 07:29:48 Latvia time, ending 09:29:48 Latvia time.
- Farm total budget: 120,000 GROUP2; per-pool budget should be 40,000 GROUP2.
- Three LP pairs each showed 100,000 of both constituent tokens in reserves.
- Pool 0 (ALPHA/GROUP2): approximately 100,000 LP staked, ~5,800 GROUP2 paid out and ~200 GROUP2 claimable in snapshot.
- Pools 1 and 2: LP in wallet, zero currently staked at snapshot.
- Claim-all transaction confirmed in saved browser evidence: `0xf206f09015fc5985fbdca6d59673a12dced2c21aeec9791c4d235e420c232f32`.

This snapshot does not provide a full chain history or prove every requirement. Use explorer transaction receipts and new screenshots for missing cases.

## Tests specified by the teacher

| Test | Saved evidence | Still needed |
|---|---|---|
| One staker receives rewards during active time | Partial: pool 0 earned/paid | Save start/end block/times, verify rate |
| Second staker joins later, no retroactive rewards | None | Two wallets with timestamps and earned values |
| Staking in multiple pools independent | None | Stake/earned/claim for pools 1 and 2 |
| Partial LP withdrawal changes later accrual | None | Record balances and rewards before/after |
| Repeated claim cannot pay twice | One claimAll confirmed | Claim twice, check second receipt/zero earned |
| Empty pool budget not passed to later staker | Pools 1/2 idle at snapshot | Stake later and compare expected accrual |
| Campaign ends: rewards stop, claim/withdraw work | Session end is documented | Test after 09:29:48 Latvia time |
| Unregistered token rejected | Fixed LP addresses in farm state | Invalid poolId revert or source/test of restriction |
| Total payouts plus owed do not exceed 120k | Farm budget/balance snapshot | Prove bounds across all pools |
| LP principal recovered | No withdrawal receipt in snapshot | Withdraw from farm and confirm wallet LP increase |
| Incorrect decimals / rounding | 18-decimal amounts recorded | Confirm small/decimal amounts |

## Files required for submission

- Three personal token contracts and addresses: ALPHA `0x256EbDd12F18956f0cE0A10D97621e60ed3bcF6D`; BETA `0xA9a48f740Be076A080baa3896d0E76aC58d9b868`; GAMMA `0xCAE1375024A3196117A1163Cfbff29260523d9DC`.
- GROUP2: `0x8666aaB75B2D6Cd579b6B3ecC24D9dAB47a33750`.
- All three LP pair addresses and GroupFarm address (see README).
- Solidity **source code** of tokens, factory/router (if created) and farm, plus original compiler versions and library versions. **Still missing:** original GroupFarm.sol; an ABI alone is not a replacement.
- Transaction hashes for deployment, token allocation/funding, LP creation, approve, stake, claim, withdraw. **Still missing:** most hashes.
- Test table with transaction links, observed/expected values, screenshots.
- Working published website **URL** and source files. **Still missing:** publish + real wallet testing.
- Short work split/problems/solution report; explanation of where GROUP2 reward funding comes from, multiple staker dilution, admin/owner risks, and why nominal prices are not proof of real value.

## Example report text (adjust to actual group contributions)

"We created the GROUP2 test token and three ALPHA/GROUP2, BETA/GROUP2 and GAMMA/GROUP2 Uniswap v2 liquidity pairs on Sepolia. LP tokens represent each user's share of liquidity. The GroupFarm contract was assigned 120,000 GROUP2 test tokens for a two-hour campaign (40,000 per pool). In each pool, participants share the reward rate in proportion to the amount of LP tokens they stake while participating. When another staker joins, the same pool reward is divided between a larger total stake; the rate per LP declines. Token owner permissions can create risks, so we document any minting, pausing or blocking capabilities. A token's nominal price is derived from reserves and is not evidence of real market value or quality. These are only testnet tokens, not real earnings."

Be clear about which tests were actually completed; do not mark missing ones as passed.
