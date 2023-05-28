import React, { useState, useEffect, useTransition } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import "firebase/firestore";
import { db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from 'next/router';
import { onSnapshot, query, orderBy } from "firebase/firestore";
import axios from 'axios';
import ImageForm from '../components/ImageForm';
// import { Link } from 'react-router-dom';

const DiaryPage = () => {
    const [date, setDate] = useState(new Date().toLocaleDateString('ko-KR'));
    const [content, setContent] = useState('');
    const [emotion, setEmotion] = useState(1);
    const [imgUrl, setImgUrl] = useState('');
    const [diaries, setDiaries] = useState([]);
    const [aiMode, setAiMode] = useState(false); // 테스트 용

    const router = useRouter();
    const { data: session, status } = useSession();

    const handleSaveDiary = async () => {

        if (!session) {
            alert('로그인이 필요합니다!');
            return;
        }

        if (content.trim() === '') {
            alert('일기 내용을 입력하세요!');
            return;
        }

        const date = new Date().toISOString().slice(0, 10);
        const diary = { content, emotion, date: serverTimestamp(), imgUrl };
        try {
            const storage = getStorage(); // Firebase Storage 인스턴스 생성

            const userDiariesCollection = collection(
                db,
                'users',
                session.user.id,
                'diaries'
            );

            await addDoc(userDiariesCollection, diary);
            console.log('Diary successfully written!');
            alert('일기가 정상적으로 저장되었습니다.');
        } catch (e) {
            console.error('Error writing document: ', e);
        }

        setContent('');
        setEmotion(1);
        setImgUrl(null);
    };
    const handleGenerateImage = () => {
        const url = "https://picsum.photos/seed/" + Date.now() + "/800/600";
        setImgUrl(url);
    };
    const handleGenerateImage_AI = async (event) => {
        event.preventDefault();
        console.log("prompt: " + content);

        try {
            const res = await fetch('/api/image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: content }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            setImgUrl(data.imageUrl);
        } catch (error) {
            // 오류 객체 전체를 출력
            console.error("이미지 생성 요청에서 오류 발생: ", error);

            // 오류 메시지를 출력
            console.error("오류 메시지: ", error.message);

            // 오류가 발생한 위치를 출력 (브라우저에서 지원하는 경우)
            console.error("오류 스택: ", error.stack);

            // fetch 요청에 사용한 URL과 옵션을 출력
            console.error("fetch 요청 URL: /api/image");
            console.error("fetch 요청 옵션: ", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
        }
    };
    const handleContentChange = (e) => setContent(e.target.value);
    const handleEmotionChange = (val) => setEmotion(val);
    const handleAiModeChange = () => setAiMode(!aiMode);

    return (

        <div className="flex min-h-screen flex-col bg-gray-100 p-4">

            <div className="flex self-start items-center bg-gray-200 p-2 rounded mb-4">
                {session ? (
                    <>
                        <img
                            src={session.user.image}
                            alt="Profile Picture"
                            className="rounded-full h-8 w-8 mr-2"
                        />
                        <p className="text-xs font-bold text-gray-800">
                            Logged in as {session?.user?.name}
                        </p>
                    </>
                ) : (
                    <p className="text-xs font-bold text-gray-800"> // 텍스트 크기 줄이기
                        Not logged in
                    </p>
                )}
            </div>


            <div className="flex flex-grow items-center justify-center">
                <div className="w-2/5 flex flex-col items-center justify-center pr-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">{date}</h1> {/* 날짜 표시 수정 */}
                    <textarea
                        value={content}
                        onChange={handleContentChange}
                        placeholder="일기를 작성하세요..."
                        className="w-full md:w-1/2 h-96 px-3 py-2 mb-6 text-gray-700 border rounded-lg focus:outline-none focus:shadow-outline"
                    />

                    <div className="flex justify-center mb-6">
                        {[1, 2, 3, 4, 5].map((val) => (
                            <button
                                key={val}
                                onClick={() => handleEmotionChange(val)}
                                className={`w-12 h-12 rounded-full border-2 border-gray-300 focus:outline-none mx-2 ${emotion === val ? 'bg-blue-500' : 'bg-white'
                                    }`}
                            >
                                {val}
                            </button>
                        ))}
                    </div>


                    <button
                        onClick={aiMode ? handleGenerateImage_AI : handleGenerateImage}
                        className="w-full md:w-1/2 px-4 py-2 mb-6 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-400 focus:outline-none focus:shadow-outline"
                    >
                        그림 생성
                    </button>
                    <div className="flex">
                        <input
                            type="checkbox"
                            className="mr-2 cursor-pointer"
                            checked={aiMode}
                            onChange={handleAiModeChange}
                        />
                        <p className="text-lg font-bold text-gray-800">AI로 그림 생성(미선택 시 무작위로 더미 사진 생성)</p>
                    </div>
                </div>
                <div className="w-3/5 h-1/2 flex flex-col items-center justify-center pr-5">

                    <div className="overflow-auto bg-white rounded-lg shadow-md flex items-center justify-center text-gray-500 text-lg h-[600px] w-[800px]">
                        {imgUrl ? (
                            <img
                                src={imgUrl}
                                alt="Generated Art"
                                className="object-contain max-h-full max-w-full"
                            />
                        ) : (
                            <div className="justify-center items-center" >
                                <p className="text-xl font-bold">이 곳에 생성된 그림이 표시됩니다.</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSaveDiary}
                        className="w-full md:w-1/2 px-4 py-2 mt-4 font-bold text-white bg-green-500 rounded-full hover:bg-green-400 focus:outline-none focus:shadow-outline"
                    >
                        일기 저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiaryPage;
