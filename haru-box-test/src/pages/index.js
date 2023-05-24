
import React, { useState, useEffect } from 'react';
import firebase from "firebase/app";
import "firebase/firestore";
import{ db } from "@/firebase";

function DiaryPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // 현재 날짜 얻기
  const [content, setContent] = useState('');  // 본문 입력 필드 상태
  const [emotion, setEmotion] = useState(1);  // 감정 상태
  const [imgUrl, setImgUrl] = useState(null);  // 이미지 URL 상태
  const [diaries, setDiaries] = useState([]);

  const [selectedDiary, setSelectedDiary] = useState(null);

  useEffect(() => {
    if (selectedDiary) {
      setContent(selectedDiary.content);
      setEmotion(selectedDiary.emotion);
      setImgUrl(selectedDiary.imgUrl);
    }
  }, [selectedDiary]);

  const handleContentChange = (e) => setContent(e.target.value);
  const handleGenerateImage = () => {
    const url = "https://picsum.photos/seed/" + Date.now() + "/800/600";
    setImgUrl(url);
  };
  const handleEmotionChange = (e) => setEmotion(e.target.value);
  const handleSave = () => {

     if (content.trim() === '') {
    alert('일기 내용을 입력하세요!');
    return;
  }

    const date = new Date().toISOString().slice(0, 10); // 현재 날짜 얻기

    // 현재 일기 정보를 저장
    setDiaries(prev => [...prev, { date, content, emotion, imgUrl }]);

    console.log('Content:', content);
    console.log('Emotion:', emotion);
    console.log('Image URL:', imgUrl);

    // 일기를 저장한 후 입력 필드와 이미지를 초기화
    setContent('');
    setEmotion(1);
    setImgUrl(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 p-4">
      <div className="w-2/3 flex flex-col items-center justify-center pr-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{date}</h1> {/* 날짜 표시 수정 */}
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="일기를 작성하세요..."
          className="w-full md:w-1/2 h-40 px-3 py-2 mb-6 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
        />

        <select
          value={emotion}
          onChange={handleEmotionChange}
          className="w-full md:w-1/2 mb-6 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

        <button
          onClick={handleGenerateImage}
          className="w-full md:w-1/2 px-4 py-2 mb-6 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-400 focus:outline-none focus:shadow-outline"
        >
          그림 생성
        </button>

        {imgUrl && (
          <div className="w-full md:w-1/2 h-64 mb-6 overflow-auto bg-white rounded-lg shadow-md">
            <img
              src={imgUrl}
              alt="Diary"
              className="object-cover w-full h-full" // 이미지가 컨테이너를 꽉 채우도록 수정
            />
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full md:w-1/2 px-4 py-2 font-bold text-white bg-green-500 rounded-full hover:bg-green-400 focus:outline-none focus:shadow-outline"
        >
          저장
        </button>
      </div>
      <div className="w-1/3 flex flex-col bg-white p-4 rounded-lg shadow-md overflow-y-scroll">
  {diaries.map((diary, index) => (
    <p
      key={index}
      onClick={() => setSelectedDiary(diary)}
      className="cursor-pointer hover:bg-gray-200 flex justify-between"
    >
      <span>{diary.content.length > 20 ? diary.content.substring(0, 20) + "..." : diary.content}</span>
      <span>{diary.date}</span>
    </p>
  ))}
</div>


    </div>
  );

}

export default DiaryPage;
