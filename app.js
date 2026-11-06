// GROUP2 Sepolia LP staking dashboard. Connects only to existing deployed contracts.
// MetaMask signs transactions. Never enter a seed phrase or private key here.
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.17.0/dist/ethers.min.js";

const CHAIN_ID = 11155111n;
const CHAIN_ID_HEX = "0xaa36a7";
const FARM_ADDRESS = "0x2c77557d5d92776f6d452e1BFDe9EB0ea5d02DC5";
const REWARD_ADDRESS = "0x8666aaB75B2D6Cd579b6B3ecC24D9dAB47a33750";
const EXPLORER = "https://sepolia.etherscan.io";
const HISTORY_KEY = "group2-farm-confirmed-tx-v1";
const POOLS = [
  { name: "ALPHA / GROUP2", lp: "0xFF065D1E58B24E26e17596bfbe4731EF54fE826E" },
  { name: "BETA / GROUP2", lp: "0xC45F7E8768d9a3CD954188f86627E4a0314fA631" },
  { name: "GAMMA / GROUP2", lp: "0xc28760861c1b64c37198be1ec03E9ed5d37f24AE" }
];

// These signatures match GroupFarm.abi.json recovered from the original deployment.
const farmABI = [
  "function started() view returns (bool)",
  "function startTime() view returns (uint256)",
  "function endTime() view returns (uint256)",
  "function duration() view returns (uint256)",
  "function rewardToken() view returns (address)",
  "function pools(uint256) view returns (address lpToken, uint256 totalStaked, uint256 rewardPerTokenStored, uint256 lastUpdateTime, uint256 paidOut)",
  "function balances(uint256,address) view returns (uint256)",
  "function earned(address,uint256) view returns (uint256)",
  "function earnedAll(address) view returns (uint256)",
  "function TOTAL_BUDGET() view returns (uint256)",
  "function POOL_BUDGET() view returns (uint256)",
  "function claim(uint256)",
  "function claimAll()",
  "function stake(uint256,uint256)",
  "function withdraw(uint256,uint256)"
];
const tokenABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)"
];

let provider;
let signer;
let account;
let farm;
let rewardToken;
let rewardDecimals = 18;
let campaignStart = 0;
let campaignEnd = 0;
let campaignStarted = false;
let updating = false;
let transactionPending = false;
let dataLoaded = false;
const poolData = [null, null, null];

const $ = id => document.getElementById(id);
const txLink = hash => `${EXPLORER}/tx/${hash}`;
const addrLink = addr => `${EXPLORER}/address/${addr}`;
const shortAddress = addr => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
const nowSeconds = () => Math.floor(Date.now() / 1000);
const isActive = () => campaignStarted && nowSeconds() >= campaignStart && nowSeconds() < campaignEnd;

function displayAmount(value, decimals = 18) {
  const text = ethers.formatUnits(value, decimals);
  const [whole, fraction = ""] = text.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const small = fraction.slice(0, 5).replace(/0+$/, "");
  if (small) return `${grouped}.${small}`;
  if (BigInt(value) > 0n && whole === "0") return "<0.00001";
  return grouped;
}
function validAmount(text, decimals) {
  if (!/^\d+(\.\d+)?$/.test(text.trim())) throw new Error("Enter a positive numeric LP amount (use a dot for decimals).");
  const amount = ethers.parseUnits(text.trim(), decimals);
  if (amount <= 0n) throw new Error("Amount must be greater than zero.");
  return amount;
}
function friendlyError(error) {
  if (error?.code === 4001 || error?.info?.error?.code === 4001 || error?.code === "ACTION_REJECTED") {
    return "The wallet request was rejected.";
  }
  return error?.shortMessage || error?.reason || error?.message || "Unknown error.";
}
function notify(message, kind = "") {
  const panel = $("txPanel");
  panel.className = `transaction ${kind}`;
  panel.textContent = message;
}
function notifyTransaction(message, hash, kind = "") {
  notify(message, kind);
  const a = document.createElement("a");
  a.href = txLink(hash);
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = ` View on Etherscan: ${shortAddress(hash)}`;
  $("txPanel").appendChild(a);
}
function clearNumbers() {
  $("walletValue").textContent = "Not connected";
  $("networkValue").textContent = "Network: —";
  ["rewardBalance", "claimable", "farmFunds", "totalBudget"].forEach(id => $(id).textContent = "—");
  $("campaignStatus").textContent = "Connect wallet to load";
  $("campaignDates").textContent = "Start: — · End: —";
  $("timeRemaining").textContent = "—";
  poolData.fill(null);
  dataLoaded = false;
  renderPools();
  setButtonsEnabled(false);
}
function renderPools() {
  $("pools").innerHTML = POOLS.map((pool, i) => `
    <article class="pool-card">
      <div class="pool-heading"><div><div class="pool-title">${pool.name}</div><div class="pool-subtitle">v2 LP token · Pool ${i}</div></div><span class="pool-number">${i}</span></div>
      <div class="pool-address" title="${pool.lp}">LP: <a href="${addrLink(pool.lp)}" target="_blank" rel="noopener noreferrer">${shortAddress(pool.lp)}</a></div>
      <div class="pool-detail"><span>LP in wallet</span><strong id="walletLP${i}">—</strong></div>
      <div class="pool-detail"><span>Your staked LP</span><strong id="stakedLP${i}">—</strong></div>
      <div class="pool-detail"><span>Total staked LP</span><strong id="totalLP${i}">—</strong></div>
      <div class="pool-detail"><span>Earned GROUP2</span><strong id="earned${i}">—</strong></div>
      <div class="divider"></div>
      <div class="field-row"><label for="amount${i}">LP amount</label><span class="quick-amounts"><button class="secondary" id="max${i}" type="button">Max wallet</button><button class="secondary" id="maxStaked${i}" type="button">Max staked</button></span></div>
      <input id="amount${i}" placeholder="0.0" inputmode="decimal" autocomplete="off" aria-label="LP amount for ${pool.name}">
      <div class="pool-buttons">
        <button class="secondary" id="approve${i}" disabled>Approve</button>
        <button class="primary" id="stake${i}" disabled>Stake</button>
        <button class="secondary" id="withdraw${i}" disabled>Withdraw</button>
        <button class="secondary" id="claim${i}" disabled>Claim</button>
      </div>
      <div class="pool-links"><a href="${addrLink(pool.lp)}" target="_blank" rel="noopener noreferrer">LP contract</a><a href="https://app.uniswap.org/positions" target="_blank" rel="noopener noreferrer" title="Custom testnet pairs may not show here; use the original compatible router to remove liquidity">Liquidity management*</a></div>
    </article>
  `).join("");
  POOLS.forEach((_, i) => {
    $("max" + i).addEventListener("click", () => setMax(i, false));
    $("maxStaked" + i).addEventListener("click", () => setMax(i, true));
    ["approve", "stake", "withdraw", "claim"].forEach(action => {
      $(action + i).addEventListener("click", () => doAction(i, action));
    });
  });
}
function setMax(i, staked) {
  if (!poolData[i]) return;
  const data = poolData[i];
  $("amount" + i).value = ethers.formatUnits(staked ? data.stakedLP : data.walletLP, data.decimals);
}
function setButtonsEnabled(on) {
  const ready = !!(on && account && dataLoaded && !updating && !transactionPending);
  POOLS.forEach((_, i) => {
    $("approve" + i).disabled = !ready || !isActive();
    $("stake" + i).disabled = !ready || !isActive();
    $("withdraw" + i).disabled = !ready;
    $("claim" + i).disabled = !ready;
    $("max" + i).disabled = !ready;
    $("maxStaked" + i).disabled = !ready;
  });
  $("claimAllBtn").disabled = !ready;
  $("refreshBtn").disabled = !ready;
  $("connectBtn").disabled = transactionPending || updating;
  $("exportBtn").disabled = !readHistory().length;
}
function readHistory() {
  try {
    const records = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(records) ? records : [];
  } catch { return []; }
}
function addConfirmedTransaction(description, receipt) {
  try {
    const record = {
      action: description, hash: receipt.hash, blockNumber: receipt.blockNumber,
      chainId: String(CHAIN_ID), account, farm: FARM_ADDRESS, status: "confirmed",
      savedAt: new Date().toISOString()
    };
    const history = [record, ...readHistory().filter(item => item.hash !== record.hash)].slice(0, 100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* The site still works when browser storage is disabled. */ }
  renderHistory();
}
function renderHistory() {
  const history = readHistory();
  const mine = account ? history.filter(x => x.account?.toLowerCase() === account.toLowerCase()) : history;
  const list = $("txHistory");
  list.replaceChildren();
  if (!mine.length) {
    const message = document.createElement("p");
    message.className = "muted";
    message.textContent = "No confirmed transactions recorded in this browser yet.";
    list.append(message);
  }
  for (const record of mine.slice(0, 8)) {
    if (!/^0x[a-fA-F0-9]{64}$/.test(record.hash)) continue;
    const item = document.createElement("div");
    item.className = "history-entry";
    const label = document.createElement("span");
    label.textContent = `${record.action} · block ${record.blockNumber}`;
    const link = document.createElement("a");
    link.href = txLink(record.hash);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = shortAddress(record.hash);
    item.append(label, link);
    list.append(item);
  }
  $("exportBtn").disabled = !mine.length;
}
function exportHistory() {
  const records = account ? readHistory().filter(x => x.account?.toLowerCase() === account.toLowerCase()) : readHistory();
  if (!records.length) return;
  const blob = new Blob([JSON.stringify({ note: "Browser-collected confirmed transactions, not a full chain history", transactions: records }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "GROUP2-confirmed-transactions.json";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

async function connectWallet() {
  if (!window.ethereum) {
    notify("MetaMask is not available. Install or enable a compatible browser wallet.", "error");
    return;
  }
  $("connectBtn").disabled = true;
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.BrowserProvider(window.ethereum);
    let network = await provider.getNetwork();
    if (network.chainId !== CHAIN_ID) {
      notify("Select Sepolia in MetaMask when requested...");
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_ID_HEX }] });
      provider = new ethers.BrowserProvider(window.ethereum);
      network = await provider.getNetwork();
    }
    if (network.chainId !== CHAIN_ID) throw new Error("Please select the Ethereum Sepolia test network.");
    signer = await provider.getSigner();
    account = await signer.getAddress();
    farm = new ethers.Contract(FARM_ADDRESS, farmABI, signer);
    rewardToken = new ethers.Contract(REWARD_ADDRESS, tokenABI, signer);
    // Ensure that the saved contract and tokens match the on-chain farm before enabling writes.
    const actualReward = await farm.rewardToken();
    if (actualReward.toLowerCase() !== REWARD_ADDRESS.toLowerCase()) {
      throw new Error("Reward token mismatch. Check the GroupFarm contract address.");
    }
    rewardDecimals = Number(await rewardToken.decimals());
    $("walletValue").textContent = shortAddress(account);
    $("walletValue").title = account;
    $("networkValue").textContent = "Network: Sepolia (11155111)";
    $("connectBtn").textContent = "Connected: " + shortAddress(account);
    notify("Wallet connected. Loading live Sepolia data...");
    renderHistory();
    await refreshData();
  } catch (error) {
    account = undefined;
    farm = undefined;
    rewardToken = undefined;
    clearNumbers();
    $("connectBtn").textContent = "Connect MetaMask";
    notify("Wallet connection failed: " + friendlyError(error), "error");
  } finally {
    $("connectBtn").disabled = false;
  }
}
async function refreshData(silent = false) {
  if (!farm || updating || transactionPending) return;
  updating = true;
  dataLoaded = false;
  setButtonsEnabled(false);
  try {
    const [started, start, end, farmBalance, walletBalance, totalEarned, budget] = await Promise.all([
      farm.started(), farm.startTime(), farm.endTime(), rewardToken.balanceOf(FARM_ADDRESS),
      rewardToken.balanceOf(account), farm.earnedAll(account), farm.TOTAL_BUDGET()
    ]);
    campaignStarted = started;
    campaignStart = Number(start);
    campaignEnd = Number(end);
    $("rewardBalance").textContent = displayAmount(walletBalance, rewardDecimals);
    $("claimable").textContent = displayAmount(totalEarned, rewardDecimals);
    $("farmFunds").textContent = displayAmount(farmBalance, rewardDecimals);
    $("totalBudget").textContent = displayAmount(budget, rewardDecimals);
    $("campaignDates").textContent = `Start: ${dateText(campaignStart)} · End: ${dateText(campaignEnd)}`;
    updateCampaignDisplay();

    for (let i = 0; i < POOLS.length; i++) {
      const info = await farm.pools(i);
      if (info.lpToken.toLowerCase() !== POOLS[i].lp.toLowerCase()) {
        throw new Error(`Pool ${i} LP address does not match the saved contract details. Transactions disabled.`);
      }
      const lpToken = new ethers.Contract(POOLS[i].lp, tokenABI, signer);
      const [decimals, walletLP, stakedLP, yourEarned] = await Promise.all([
        lpToken.decimals(), lpToken.balanceOf(account), farm.balances(i, account), farm.earned(account, i)
      ]);
      const n = Number(decimals);
      poolData[i] = { token: lpToken, decimals: n, walletLP, stakedLP };
      $("walletLP" + i).textContent = displayAmount(walletLP, n);
      $("stakedLP" + i).textContent = displayAmount(stakedLP, n);
      $("totalLP" + i).textContent = displayAmount(info.totalStaked, n);
      $("earned" + i).textContent = displayAmount(yourEarned, rewardDecimals);
    }
    dataLoaded = true;
    if (!silent) notify("All three pools loaded from Sepolia.", "success");
  } catch (error) {
    dataLoaded = false;
    notify("Could not refresh: " + friendlyError(error), "error");
  } finally {
    updating = false;
    setButtonsEnabled(dataLoaded);
  }
}
function dateText(seconds) {
  return seconds ? new Date(seconds * 1000).toLocaleString() : "—";
}
function updateCampaignDisplay() {
  if (!campaignStarted) {
    $("campaignStatus").textContent = "Not started";
    $("timeRemaining").textContent = "—";
  } else {
    const remaining = Math.max(0, campaignEnd - nowSeconds());
    $("campaignStatus").textContent = isActive() ? "Active" : (nowSeconds() >= campaignEnd ? "Ended — claim and withdraw available" : "Scheduled");
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    $("timeRemaining").textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  // Do not re-enable buttons during an in-progress transaction or a failed refresh.
  if (account) setButtonsEnabled(dataLoaded);
}
async function ensureSepolia() {
  const actual = await window.ethereum.request({ method: "eth_chainId" });
  if (BigInt(actual) !== CHAIN_ID) throw new Error("Switch your wallet to Sepolia before sending a transaction.");
}
async function sendTransaction(send, description) {
  if (transactionPending) return;
  transactionPending = true;
  setButtonsEnabled(false);
  let hash;
  try {
    await ensureSepolia();
    notify(`Waiting for MetaMask confirmation: ${description}...`);
    const tx = await send();
    hash = tx.hash;
    notifyTransaction("Submitted to Sepolia. Waiting for the transaction receipt...", hash);
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) {
      throw new Error("The transaction reverted or was not confirmed successfully.");
    }
    addConfirmedTransaction(description, receipt);
    notifyTransaction(`${description} confirmed on-chain.`, receipt.hash, "success");
  } catch (error) {
    const message = `${description} failed: ${friendlyError(error)}`;
    if (hash) notifyTransaction(message, hash, "error");
    else notify(message, "error");
  } finally {
    transactionPending = false;
    // Refresh on-chain state after both success and failure; do not assume submission equals success.
    await refreshData(true);
    setButtonsEnabled(dataLoaded);
  }
}
async function doAction(i, action) {
  if (transactionPending || updating) return;
  if (!account || !poolData[i]) return notify("Connect a Sepolia wallet first.", "error");
  try {
    const { token, decimals, walletLP, stakedLP } = poolData[i];
    if (action === "claim") return await sendTransaction(() => farm.claim(i), `Claim from pool ${i}`);
    const amount = validAmount($("amount" + i).value, decimals);
    if (action === "withdraw") {
      if (amount > stakedLP) throw new Error("You cannot withdraw more than your staked LP balance.");
      return await sendTransaction(() => farm.withdraw(i, amount), `Withdraw from pool ${i}`);
    }
    if (!isActive()) throw new Error("The campaign is not active. Claim and Withdraw remain available.");
    if (amount > walletLP) throw new Error("You do not have enough LP tokens in your wallet.");
    if (action === "approve") return await sendTransaction(() => token.approve(FARM_ADDRESS, amount), `Approve pool ${i} LP`);
    if (action === "stake") {
      const allowance = await token.allowance(account, FARM_ADDRESS);
      if (allowance < amount) throw new Error("Approve this LP amount first and wait for confirmation.");
      return await sendTransaction(() => farm.stake(i, amount), `Stake LP in pool ${i}`);
    }
  } catch (error) {
    notify(`${action} failed: ${friendlyError(error)}`, "error");
  }
}
async function claimAll() {
  if (transactionPending || updating) return;
  if (!farm) return notify("Connect your wallet first.", "error");
  await sendTransaction(() => farm.claimAll(), "Claim all rewards");
}

$("farmLink").href = addrLink(FARM_ADDRESS);
$("tokenLink").href = addrLink(REWARD_ADDRESS);
renderPools();
renderHistory();
clearNumbers();
$("connectBtn").addEventListener("click", connectWallet);
$("refreshBtn").addEventListener("click", () => refreshData());
$("claimAllBtn").addEventListener("click", claimAll);
$("exportBtn").addEventListener("click", exportHistory);
setInterval(updateCampaignDisplay, 1000);
setInterval(() => { if (account && !updating && !transactionPending) refreshData(true); }, 30000);
if (window.ethereum?.on) {
  window.ethereum.on("accountsChanged", () => window.location.reload());
  window.ethereum.on("chainChanged", () => window.location.reload());
}
