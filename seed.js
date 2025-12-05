const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Word = require('./src/models/word'); // 모델 경로는 src 폴더 기준으로 유지

// .env 파일 로드
dotenv.config();

// DB 연결 함수
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

// 데이터 입력 함수
const importData = async () => {
  try {
    // 1. JSON 데이터 파일 읽기 (경로 수정: 'src/data' -> 'data')
    const n3Words = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'words_n3.json'), 'utf-8'));
    const n2Words = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'words_n2.json'), 'utf-8'));
    const n1Words = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'words_n1.json'), 'utf-8'));

    // 2. 데이터 통합 및 중복 제거
    const allWords = [...n3Words, ...n2Words, ...n1Words];
    const uniqueWordsMap = new Map();
    allWords.forEach(word => {
      // word 필드를 기준으로, 맵에 없는 단어만 추가 (나중에 나온 중복 단어는 무시됨)
      if (!uniqueWordsMap.has(word.word)) {
        uniqueWordsMap.set(word.word, word);
      }
    });
    const uniqueWords = Array.from(uniqueWordsMap.values());

    // 3. 기존 데이터 모두 삭제
    await Word.deleteMany();
    console.log('Previous data destroyed...');

    // 4. 중복 제거된 데이터를 DB에 삽입
    await Word.insertMany(uniqueWords);

    // 5. 최종 로그 출력
    console.log(`N1, N2, N3 파일 통합 완료. 총 ${uniqueWords.length}개의 단어가 DB에 저장되었습니다.`);
    process.exit(); // 성공 시 프로세스 종료

  } catch (err) {
    console.error('Error during data import:', err.message);
    process.exit(1); // 오류 시 프로세스 종료
  }
};

// 스크립트 실행
const runSeed = async () => {
  await connectDB();
  await importData();
};

runSeed();
