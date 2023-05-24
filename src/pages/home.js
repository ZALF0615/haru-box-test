import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import "firebase/firestore";
import { db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/router';
import { onSnapshot, query, orderBy } from "firebase/firestore";
import axios from 'axios';

function DiaryPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState(1);
  const [imgFile, setImgFile] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [diaries, setDiaries] = useState([]);
  const [selectedDiary, setSelectedDiary] = useState(null);

  const router = useRouter();
  const { data: session, status } = useSession();

  const getDiaries = () => {
    const storage = getStorage(); // Firebase Storage 인스턴스 생성
  
    const userDiariesCollection = collection(db, 'users', session.user.id, 'diaries');
    const q = query(userDiariesCollection, orderBy('date', 'desc'));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDiaries = [];
  
      snapshot.forEach(async (doc) => { // forEach 콜백 함수를 비동기 함수로 변경
        const data = doc.data();
        const date = data.date ? data.date.toDate().toISOString().slice(0, 10) : null;
        const diary = {
          id: doc.id,
          content: data.content,
          date: date,
          emotion: data.emotion,
          imgUrl: data.imgUrl,
        };
  
        // 이미지 URL이 있는 경우, 해당 URL을 다운로드하여 imgUrl을 업데이트
        if (diary.imgUrl) {
          try {
            const url = await getDownloadURL(ref(storage, diary.imgUrl));
            diary.imgUrl = url;
          } catch (error) {
            console.error('Error getting download URL:', error);
          }
        }
  
        fetchedDiaries.push(diary); // 비동기 함수 내에서 배열에 추가
  
        if (fetchedDiaries.length === snapshot.size) {
          setDiaries(fetchedDiaries); // 마지막 아이템일 경우에만 리스트 업데이트
        }
      });
    });
  
    return () => unsubscribe();
  };
  

  useEffect(() => {
    if (status === 'authenticated' && session && session.user) {
      const unsubscribe = getDiaries();
      return () => {
        unsubscribe();
      };
    }
  }, [status, session]);

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (selectedDiary) {
      setContent(selectedDiary.content);
      setEmotion(selectedDiary.emotion);
      setImgUrl(selectedDiary.imgUrl);
    }
  }, [selectedDiary]);

  const handleContentChange = (e) => setContent(e.target.value);
  const handleGenerateImage = () => {
    setImgUrl(null); // imgUrl 초기화
    const url = "https://picsum.photos/seed/" + Date.now() + "/800/600";

    axios.get(url, { responseType: 'blob' }) // 사진 파일 가져오기
      .then((response) => {
        const file = new File([response.data], 'generated_image.jpg', { type: 'image/jpeg' });
        setImgFile(file); // 사진 파일을 imgFile 상태로 저장
        console.log("사진 저장!");
      })
      .catch((error) => {
        console.error('Error generating image:', error);
      });
  };
  const handleEmotionChange = (e) => setEmotion(e.target.value);
  const handleSave = async () => {
    if (content.trim() === '') {
      alert('일기 내용을 입력하세요!');
      return;
    }

    const date = new Date().toISOString().slice(0, 10);
    const diary = { content, emotion, date: serverTimestamp() };
    try {
      const storage = getStorage(); // Firebase Storage 인스턴스 생성

      const userDiariesCollection = collection(
        db,
        'users',
        session.user.id,
        'diaries'
      );

      let imgUrl = null;
      if (imgFile) {
        const storageRef = ref(storage, `images/${Date.now()}_${imgFile.name}`);
        await uploadBytes(storageRef, imgFile);
        imgUrl = await getDownloadURL(storageRef);
      }

      diary.imgUrl = imgUrl;

      await addDoc(userDiariesCollection, diary);
      console.log('Diary successfully written!');
      setDiaries((prev) => [...prev, { date, content, emotion, imgUrl }]);
    } catch (e) {
      console.error('Error writing document: ', e);
    }

    setContent('');
    setEmotion(1);
    setImgFile(null);
    setImgUrl(null);
  };
  const handleSelectDiary = (diary) => {
    setSelectedDiary(diary);

    if (diary.imgUrl) {
      const storage = getStorage(); // Firebase Storage 인스턴스 생성
      const storageRef = ref(storage, diary.imgUrl);

      getDownloadURL(storageRef)
        .then((url) => {
          setImgFile(null); // 이전에 선택한 이미지 초기화
          setImgUrl(url);
        })
        .catch((error) => {
          console.error('Error getting download URL:', error);
        });
    } else {
      setImgFile(null);
      setImgUrl(null);
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-100 p-4">
      <div className="w-2/3 flex flex-col items-center justify-center pr-4">
        {session ? (
          <p className="text-sm font-bold text-gray-800 mb-6">
            Logged in as {session?.user?.name}
          </p>
        ) : (
          <p className="text-sm font-bold text-gray-800 mb-6">
            Not logged in
          </p>
        )}

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

        {(imgUrl || imgFile) && (
          <div className="w-full md:w-1/2 h-64 mb-6 overflow-auto bg-white rounded-lg shadow-md">
            <img
              src={imgUrl || URL.createObjectURL(imgFile)}
              alt="Selected Diary"
              className="object-cover w-full h-full"
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
            onClick={() => {setSelectedDiary(diary)}}
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
