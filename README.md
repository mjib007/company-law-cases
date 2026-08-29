# 中央大學商事法課程_案例分析（company-law-cases）

![Profile views](https://komarev.com/ghpvc/?username=mjib007-company-law-cases&label=Profile%20views&color=4c8eda&style=flat)
[![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey)](LICENSE)
![Status](https://img.shields.io/badge/status-active-success)

中央大學商事法課程用教學專案。以《圖解公司法》章節架構為骨幹，結合公司法、證券交易法相關實務案例，供課堂學習、案例討論與同學提交作業使用，同時作為本書未來改版的素材庫。

**總覽頁（GitHub Pages）**：https://mjib007.github.io/company-law-cases/

## 這個 repo 是什麼

- **章節骨架**：依《圖解公司法》目錄建立對應分類（見 `index.html` 中的 `CHAPTERS`），涵蓋公司法第一章至第九章
- **內容**：教師筆記與學生提交案例統一放在 `lectures/` 資料夾（平面結構，不分子資料夾），透過 `index.html` 的分類標籤關聯到對應章節
- **課堂評分**：同學提交內容的完整度與品質，將作為課堂評分依據之一

## 如何參與（同學適用）

請參考 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解案例提交方式。

## 目錄結構

```
company-law-cases/
├── index.html                      # 總覽頁（分類地圖＋搜尋＋卡片牆，GitHub Pages 進入點）
├── lectures/                         # 教師筆記與學生案例（平面存放，分類靠 index.html 內的 metadata）
├── .github/
│   ├── workflows/
│   │   └── pr-daily-review.yml     # 每日排程：自動審查／建議評分 PR（見下方「PR 自動審查機制」）
│   ├── scripts/
│   │   └── pr_review.py            # 上述排程實際執行的邏輯
│   └── CODEOWNERS                  # .github/ 路徑的變更需老師本人核准才能合併
├── CONTRIBUTING.md                 # 案例提交規則、AI協助與具名規則、隱私與安全機制
├── TODO.md                         # 目前進度與待辦
└── LICENSE
```

新增內容時，只需要：
1. 把 HTML 檔案放進 `lectures/` 資料夾
2. 在 `index.html` 的 `LECTURES` 陣列裡新增一筆物件（條號、標題、日期、對應章節 key、檔案路徑、author 為 teacher 或 student）

## PR 自動審查機制

本 repo 設有每天台北時間 18:00 自動執行的 GitHub Actions 排程，會：

- 掃描目前所有 PR，只有貼上 `ready-for-review` 標籤的才會進入 AI 審查與建議評分流程（避免垃圾 PR 濫用 API 額度）
- 產生一則「PR 每日審查報告」Issue，內容包含 AI 初步審查意見、依學號排序的建議分數表（僅供參考，最終分數與是否合併皆由老師人工決定）
- 內建 `.github/` 路徑異動安全掃描、提示詞注入（Prompt Injection）關鍵字掃描、內容過長截斷警示
- 學生姓名與學號在報告中一律遮蔽顯示（詳見 [CONTRIBUTING.md](./CONTRIBUTING.md)）

搭配 branch protection（要求 PR 需人工核准才能合併）與 CODEOWNERS（`.github/` 路徑變更需老師本人核准），構成這個公開 repo 的內容安全防線。

## 授權

本專案採用 [CC BY-NC 4.0](./LICENSE) 授權，僅限非商業用途使用與轉載，並須標明出處。

## 🔧 給其他老師：如何用同樣方法建立你自己科目的案例集

這個 repo 的內容（章節分類、講義格式、版次與計數器、GitHub 推送流程）是透過與 Claude 對話、搭配一份自訂的 [`SKILL.md`](./SKILL.md) 規則產生的。這套方法**不限於公司法**，其他科目（民法、刑法、行政法等）都可以套用同一套架構。

📖 這套設計不是憑空想像，背後參考了案例教學法、GitHub 協作教學工具、AI 輔助評分等國際實證研究，整理在[總覽頁的「教學方法參考」分頁籤](https://mjib007.github.io/company-law-cases/#methods)，附上每個方法的原始出處連結，建議評估是否採用前先看一下。

📄 如果你不是法律教育、想把這套「PR + AI 自動審查」機制套用到自己的領域，可以先看 [`PR-AI-REVIEW-METHODOLOGY.md`](./PR-AI-REVIEW-METHODOLOGY.md)，裡面整理了通用架構、新手最常踩的坑（附真實測試紀錄），以及自動化排程的可行方案比較。

### 使用方法：Claude Skills 版（推薦 Claude.ai 用戶使用）

**步驟：**
1. 進入 [Claude.ai](https://claude.ai/)，點選帳號，找到「設定（Settings）」
2. 將本 repo 的 [`SKILL.md`](./SKILL.md) 下載到本機電腦
3. **先修改檔案內容**：把裡面提到的 repo 名稱 `mjib007/company-law-cases` 換成你自己的 GitHub repo，並依你的科目調整「章節分類對照」章節，否則 AI 會嘗試 push 到別人的 repository、或沿用公司法的章節架構
4. 在設定（Settings）找到 Skills，點選新增「Add」，選擇 Upload a skill
5. 將第二步驟下載並修改好的 `SKILL.md` 上傳至 Claude
6. 之後在 Claude 內表示要找案例、寫講義、更新總覽頁，即自動啟動這套工作流程（找案例→自我驗證→寫講義→推送 GitHub→更新 index.html）

> ⚠️ 此 Skill 包含 GitHub Contents API 操作、bash 等工具指令，建議在 Claude.ai 或 Claude Code 環境使用。

### 🔑 關於推送到 GitHub 需要的 Personal Access Token

Skill 裡的「GitHub 操作流程」章節會要求你提供 GitHub Personal Access Token 才能推送內容。準備方式（二選一）：

**方法 A：手動點擊路徑**
1. 點畫面右上角你的頭像（注意：不是在某個 repo 頁面點，要在 GitHub 任何頁面都可以）→ 選單選 **Settings**
2. 進入「你的帳號設定」頁面（網址會變成 `github.com/settings/profile`），**左側選單最下方**會看到 **Developer settings**
3. 依序點：**Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**

**方法 B：網址捷徑（跳過找選單）**
- 登入狀態下，直接在網址列輸入 [github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)，會直接進入建立 Fine-grained token 的頁面
- ⚠️ 這是捷徑網址，若 GitHub 未來改版導致此網址失效，請改用方法 A 的手動路徑

**兩種方法走到最後，設定步驟相同：**
3. **Repository access** 選 **Only select repositories**，選你自己的 repo
4. **Permissions** 裡把 **Contents** 設成 **Read and write**
5. **Generate token** 後複製給 Claude

> 若你也想套用「PR 自動審查機制」（見上方章節），除了 Contents，還需要額外把 **Workflows**、**Actions**、**Issues**、**Pull requests**、**Administration** 都設成 Read and write（Pull requests 權限是幫 PR 貼 `ready-for-review` 標籤時需要的，跟單純讀寫 Issues 是分開的權限），並在 repo 的 `Settings → Secrets and variables → Actions` 新增一組名為 `ANTHROPIC_API_KEY` 的 secret（去 [console.anthropic.com](https://console.anthropic.com/settings/keys) 產生），排程才能正常呼叫 Claude API。

**注意事項：**
- 這組 token 只在**當次對話**中使用，Claude 不會把它存進記憶，換一個新對話時要重新提供
- Token 直接貼在對話裡屬於明碼傳輸，建議設定過期時間，且用完後可以到 GitHub 設定裡撤銷重發
- 若不想每次都要提供 token，可以請 Claude 只產出講義的 HTML 內容，自己手動上傳到 GitHub

## 免責聲明

本專案內容僅供教學討論使用，不構成法律意見。案例分析為教學目的整理，實際案件應以判決全文與專業法律諮詢為準。
