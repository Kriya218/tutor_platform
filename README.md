# Tutor Platform 家教平台
透過Node.js建立的伺服器，搭配Express及Handlebars建立的家教預約平台網頁

## Features
- 透過email註冊會員
- 透過Google帳號登入
- 檢視所有課程及學習時數排行
- 透過關鍵字查詢課程或老師
- 檢視課程詳細資訊(教師 profile)
- 檢視學生個人頁面
- 學生身分使用者(預設)
  - 申請成為老師
  - 編輯個人基本資料
  - 預約課程
  - 對已完成課程進行回饋
- 教師身分使用者
  - 編輯個人資料及可預約時段
  - 檢視課程預約紀錄及過往評價
- 管理員身分使用者
  - 檢視所有使用者資訊

## Screenshots
- 首頁
![index](https://github.com/user-attachments/assets/af45ef81-80d7-437d-83e7-1902e8e5d353)
- 學生個人頁面
![student_page](https://github.com/user-attachments/assets/f02426b0-4dc0-43d9-b875-3d0c4a57e996)
- 課程資訊
![tutors_profile](https://github.com/user-attachments/assets/dab430f6-5220-46a9-989c-35271a35a7ae)
- 教師個人頁面
![tutor_page](https://github.com/user-attachments/assets/33f914ca-9618-44df-bbc6-4afd7f3aa49f)

### Prerequisites
- __[Express](https://www.npmjs.com/package/express)__
- __[MySQL(v8.0.37)](https://www.mysql.com/downloads/)__

### Installation and execution 
1. Clone repo to local 複製專案到本地
``` 
git clone https://github.com/Kriya218/tutor_platform.git
```
2. Change directory to tutor-platform 移動至專案資料夾
``` 
git cd Restaurants-List
```
3. Install npm 安裝 npm 套件
``` 
npm install 
```
4. Run on server 啟動伺服器，點擊URL http://localhost:3000
