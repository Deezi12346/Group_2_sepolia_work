# GROUP2 — LP steikings Sepolia tīklā

**Grupa:** GROUP2  
**Dalībnieki:** [ierakstīt visus trīs vārdus]  
**Datums:** 06.11.2026  
**Tīkls:** Ethereum Sepolia (chain ID 11155111)

## 1. Darba mērķis

Mūsu uzdevums bija izveidot GROUP2 tokenu, trīs likviditātes pārus un kopīgu steikinga līgumu. Lietotājs iemaksā LP tokenus farmā un var saņemt GROUP2 atlīdzību. Izveidojām arī tīmekļa lapu, kur var pieslēgt MetaMask un apskatīt steikus un atlīdzības.

## 2. Izveidotie līgumi

| Līgums | Sepolia adrese |
|---|---|
| GROUP2 | `0x8666aaB75B2D6Cd579b6B3ecC24D9dAB47a33750` |
| ALPHA | `0x256EbDd12F18956f0cE0A10D97621e60ed3bcF6D` |
| BETA | `0xA9a48f740Be076A080baa3896d0E76aC58d9b868` |
| GAMMA | `0xCAE1375024A3196117A1163Cfbff29260523d9DC` |
| ALPHA/GROUP2 LP | `0xFF065D1E58B24E26e17596bfbe4731EF54fE826E` |
| BETA/GROUP2 LP | `0xC45F7E8768d9a3CD954188f86627E4a0314fA631` |
| GAMMA/GROUP2 LP | `0xc28760861c1b64c37198be1ec03E9ed5d37f24AE` |
| GroupFarm | `0x2c77557d5d92776f6d452e1BFDe9EB0ea5d02DC5` |

GROUP2 emisija: **100 000 000** tokenu ar **18 decimālzīmēm**. Farmas kopējais atlīdzību budžets ir **120 000 GROUP2**, jeb **40 000 GROUP2 katram pūlam**. Kampaņas ilgums ir 120 minūtes. Pēc saglabātajiem datiem katra pāra rezervēs bija 100 000 no katra tokena (1:1 sākuma attiecība). Šie ir testa tokeni, nevis reāla nauda.

**Svarīgi papildināt:** tokenu sākotnējais sadalījums pa makiem un rezerves turētāja adrese; tokenu īpašnieku tiesības; tokenu kopējās emisijas pārbaude un deploy transakciju hash.

## 3. Kā darbojas steikings un atlīdzība

Mēs vispirms izveidojām v2 pārus. Pievienojot likviditāti, saņēmām LP tokenus. Lietotājs apstiprina LP tokenu izmantošanu (`approve`), tad nosūta tos farmā (`stake`). Farms uzskaita iemaksāto LP apjomu un dalības laiku. Atlīdzība nāk no iepriekš finansētā GROUP2 fonda, nevis no jaunas automātiskas peļņas.

Ja vienā pūlā ienāk vēl viens steikotājs, atlīdzība tiek dalīta pēc katra dalībnieka LP daļas un dalības laika. Piemēram, ja visu trīs minūšu intervālu viens iemaksā 100 LP un otrs 300 LP, no 1000 GROUP2 pirmais saņem 250, bet otrais 750. Atsevišķu pūlu steiki savā starpā netiek sajaukti.

`claim` izņem nopelnīto GROUP2, bet `withdraw` atgriež LP tokenus. Lai atgūtu abus sākotnējos tokenus, likviditāte pēc tam jāizņem no v2 pāra ar saderīgu router.

## 4. Saglabātie testu rezultāti

06.11.2026. plkst. 07:47:52 pēc Latvijas laika tika saglabāts ķēdes datu momentuzņēmums (Sepolia bloks 12074598). Tajā ALPHA/GROUP2 pūlā bija gandrīz 100 000 LP steikā, savukārt BETA/GROUP2 un GAMMA/GROUP2 LP atradās makā, bet nebija steikoti. Saglabāts arī apstiprināts `claimAll` darījums:

https://sepolia.etherscan.io/tx/0xf206f09015fc5985fbdca6d59673a12dced2c21aeec9791c4d235e420c232f32

**Šī ir tikai daļēja pārbaude.** Trūkst apstiprinātu pierādījumu par otrā dalībnieka pievienošanos, steikiem visos pūlos, daļēju izņemšanu, atkārtotu `claim`, tukša pūla intervālu un pamatsummas atgūšanu. Šos testus nedrīkst atzīmēt kā izpildītus bez transakcijām un mērījumiem.

| Tests | Novērots rezultāts | TX hash vai ekrānattēls |
|---|---|---|
| Viens steikotājs | Daļēji apstiprināts no pool 0 datiem | [pievienot] |
| Otrais pievienojas vēlāk | Nav pārbaudīts | [pievienot] |
| Dažādi pūli darbojas neatkarīgi | Nav pārbaudīts | [pievienot] |
| Daļēja LP izņemšana | Nav pārbaudīts | [pievienot] |
| Atkārtots claim | Nav pārbaudīts | [pievienot] |
| Tukša pūla intervāls | Nav pārbaudīts | [pievienot] |
| Claim un withdraw pēc beigām | Nav pārbaudīts | [pievienot] |
| Nepareizs LP / poolId | Nav pārbaudīts | [pievienot] |
| Izmaksu budžeta ierobežojums | Nepieciešama papildu pārbaude | [pievienot] |

## 5. Tīmekļa lapa

Lapa uzrakstīta ar HTML, CSS un JavaScript. Izmantota ethers.js v6 un MetaMask. Lapa pārbauda Sepolia tīklu, GROUP2 adresi un katra LP pūla adresi. Tā rāda maka atlikumu, steiku, atlīdzību, kampaņas laiku un transakciju statusu. Transakciju var uzskatīt par veiksmīgu tikai pēc ķēdes apstiprinājuma.

**Publicētās lapas saite:** [ievietot savu GitHub Pages URL pēc publicēšanas]  
**Pirmkods:** [ievietot GitHub repozitorija URL]  
**Kompilatora/solidity bibliotēkas versijas:** [ierakstīt faktiskās izveides versijas — neizdomāt]

## 6. Darba sadalījums

- **1. dalībnieks:** [vārds — GROUP2 tokens, sākotnējais sadalījums, adreses]
- **2. dalībnieks:** [vārds — GroupFarm, atlīdzību pārbaude]
- **3. dalībnieks:** [vārds — vietne un maka integrācija]
- **Visi dalībnieki:** [aprakstīt, ko katrs tiešām darīja ar savu LP pūlu, stake/claim/withdraw]

## 7. Problēmas, riski un secinājums

Viena no problēmām bija atrast iepriekš izvietotā GroupFarm pirmkodu. Līguma adrese un ABI tika saglabāti, bet sākotnējais `GroupFarm.sol` avota fails joprojām jāatrod. ABI ļauj sazināties ar izvietoto līgumu, bet nav līdzvērtīgs tā pilnam pirmkodam.

Tokena īpašnieka tiesības var radīt riskus, ja īpašnieks varētu papildus emitēt, iesaldēt vai pārsūtīt tokenus. Mūsu gala dokumentācijā jānorāda faktiskās tiesības katram līgumam. Augsta nominālā tokena cena pati par sevi nenozīmē labu projektu: cenu nosaka arī pūla likviditāte, rezerves un reāls pieprasījums. Šajā darbā izmantotajiem tokeniem nav garantētas reālas naudas vērtības.

*Pirms iesniegšanas pārbaudiet faktisko veikto darbu, papildiniet trūkstošos pierādījumus un dalībnieku datus.*
