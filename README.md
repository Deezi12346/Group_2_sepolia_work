# GROUP2 LP Staking Website — Sepolia

A HTML/CSS/JavaScript website for your **already deployed** GROUP2 GroupFarm. No new token or farm deployment is required. The frontend was updated using the saved `GroupFarm.abi.json` and 2026-11-06 on-chain snapshot; it has **not** been verified with a real MetaMask transaction here.

## Important files

- `index.html` — wallet connection, balances, campaign status, three LP cards, transaction log.
- `style.css` — responsive styling.
- `app.js` — ethers v6 connection, reads, approvals, staking, claiming, withdrawal.
- `GroupFarm.abi.json` — original saved farm ABI used to confirm function signatures.
- `IGroupFarm.sol` — **read/write interface only**, load the existing farm with Remix **At Address**. It is NOT the original farm's source code.
- `GROUP2-evidence.json` — saved snapshot and claimAll evidence (not complete chain history).
- `TEST_CHECKLIST.md` — required student tests / missing evidence.
- `ATSKAITE_DRAFT.md` — draft report to complete with actual test results and group members.

## Run the website

1. Extract all files to one folder.
2. Open Terminal in that folder.
3. Run `python3 -m http.server 8000`.
4. Open `http://localhost:8000` in your MetaMask browser.
5. Click **Connect MetaMask**. Approve the switch to Sepolia if MetaMask asks.
6. For an active farming session: enter a small LP amount in pool 1 or 2, click **Approve**, wait for a confirmed transaction, then click **Stake**. Later use **Withdraw** and **Claim**. Test on your existing Sepolia deployment only.
7. The "Confirmed transaction evidence" panel records receipts in this browser. Click **Export JSON** to save these confirmed hashes for the report. The export is only a local browser history, not a complete blockchain transaction history.

The ethers v6 browser module is loaded from `https://cdn.jsdelivr.net/npm/ethers@6.17.0/dist/ethers.min.js` (internet required). Your wallet signs transactions; no private keys are stored or requested by this site. A small amount of **Sepolia test ETH** is needed for writing transactions. **Never enter your seed phrase anywhere on the website.**

### Important limitation: session and liquidity management

The existing two-hour farming session started on **2026-11-06 07:29:48** and ends at **09:29:48 Latvia time**. This session cannot simply be restarted. Once it ends, the page disables new **Stake** operations; it still allows **Claim** and **Withdraw**. (This behavior is a client-side control; the deployed contract enforces the actual protocol rules.)

Your LP pairs appear to use a **custom v2 factory** `0xF62c03E08ada871A0bEb309762E260a7a6a880E6`. They may not appear in the Uniswap app; use the original compatible router/script for removing liquidity. The "Liquidity management" link is a general link, **not** a promise that your custom pools will be supported.

## Publish with GitHub Pages

1. Create a public GitHub repository for the project.
2. Put `index.html`, `style.css`, and `app.js` at the **root** of the repository (not inside the extracted subfolder). You may also upload non-sensitive source files and the report. Do not upload private keys, recovery phrases, `.env` secrets, or sensitive wallet data.
3. Open **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Choose `main` and `/(root)`, then **Save**.
5. Open the actual published HTTPS URL in the MetaMask browser, test the buttons, and add that real URL to the report.

## Contract addresses (Sepolia)

- GroupFarm `0x2c77557d5d92776f6d452e1BFDe9EB0ea5d02DC5`
- GROUP2 `0x8666aaB75B2D6Cd579b6B3ecC24D9dAB47a33750`
- ALPHA/GROUP2 LP `0xFF065D1E58B24E26e17596bfbe4731EF54fE826E`
- BETA/GROUP2 LP `0xC45F7E8768d9a3CD954188f86627E4a0314fA631`
- GAMMA/GROUP2 LP `0xc28760861c1b64c37198be1ec03E9ed5d37f24AE`

## Verification status

- JavaScript syntax and HTML structure checked locally.
- Contract ABI field names and addresses checked against saved evidence.
- Live browser/MetaMask execution and Sepolia writes **not verified in this environment**. The user must run those and record exact receipts.
- Original `GroupFarm.sol`, original compiler / library versions, and many testing hashes are **still needed for complete assignment submission**.
