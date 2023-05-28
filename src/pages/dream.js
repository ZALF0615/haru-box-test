import React, { useState } from 'react';
import axios from 'axios';
import FormData from 'form-data';

export default function DreamApiTestPage() {
  const [styleId, setStyleId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [targetImage, setTargetImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState('');

  const handleStyleIdChange = (e) => {
    setStyleId(e.target.value);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleTargetImageChange = (e) => {
    setTargetImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (styleId.trim() === '' || prompt.trim() === '') {
      alert('스타일 ID와 프롬프트를 입력해주세요.');
      return;
    }

    setIsProcessing(true);

    const BASE_URL = 'https://api.luan.tools/api/tasks/';
    const headers = {
      Authorization: `Bearer {yDRplPJKnwyXCVRMsNjfRZ3dFS5rqUal}`,
      'Content-Type': 'application/json',
    };

    try {
      const postPayload = { use_target_image: targetImage !== null };
      const response = await axios.post(BASE_URL, postPayload, { headers });
      const taskId = response.data.id;

      if (targetImage !== null) {
        const targetImageUrl = response.data.target_image_url.url;
        const fields = response.data.target_image_url.fields;
        const form_data = new FormData();
        Object.entries(fields).forEach(([field, value]) => {
          form_data.append(field, value);
        });
        form_data.append('file', targetImage);
        await axios.post(targetImageUrl, form_data, {
          headers: {
            ...form_data.getHeaders(),
            ...headers,
          },
        });
      }

      const taskUrl = BASE_URL + taskId;
      const putPayload = {
        input_spec: {
          style: styleId,
          prompt,
          target_image_weight: 0.1,
          width: 960,
          height: 1560,
        },
      };
      await axios.put(taskUrl, putPayload, { headers });

      let isGenerating = true;
      while (isGenerating) {
        const getResponse = await axios.get(taskUrl, { headers });
        const state = getResponse.data.state;
        if (state === 'generating') {
          console.log('생성 중입니다.');
        } else if (state === 'failed') {
          console.log('생성 실패!');
          break;
        } else if (state === 'completed') {
          const finalUrl = getResponse.data.result;
          setResultImageUrl(finalUrl);
          console.log('이미지 생성이 완료되었습니다.');
          isGenerating = false;
        }
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    } catch (error) {
        if (error.response) {
          // 서버 응답이 있는 경우, 응답 데이터 및 상태 코드 출력
          console.log('응답 데이터:', error.response.data);
          console.log('상태 코드:', error.response.status);
        } else if (error.request) {
          // 요청이 서버에 도달하지 않은 경우 출력
          console.log('요청이 서버에 도달하지 않았습니다.');
        } else {
          // 오류가 발생한 경우 출력
          console.log('오류:', error.message);
        }
        alert('오류가 발생했습니다. 자세한 내용은 콘솔을 확인해주세요.');
      } finally {
        setIsProcessing(false);
      }
      
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Dream API 테스트 페이지</h1>
      <div className="mb-4">
        <label className="block mb-2">
          스타일 ID:
          <input
            type="text"
            value={styleId}
            onChange={handleStyleIdChange}
            className="border border-gray-300 px-4 py-2 rounded w-full"
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-2">
          프롬프트:
          <input
            type="text"
            value={prompt}
            onChange={handlePromptChange}
            className="border border-gray-300 px-4 py-2 rounded w-full"
          />
        </label>
      </div>
      <div className="mb-4">
        <label className="block mb-2">
          대상 이미지:
          <input
            type="file"
            accept="image/*"
            onChange={handleTargetImageChange}
            className="border border-gray-300 px-4 py-2 rounded w-full"
          />
        </label>
      </div>
      <button
        onClick={handleSubmit}
        disabled={isProcessing}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isProcessing ? '처리 중...' : '제출'}
      </button>
      {resultImageUrl && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">생성된 이미지:</h2>
          <img src={resultImageUrl} alt="Generated" className="max-w-full" />
        </div>
      )}
    </div>
  );
}
