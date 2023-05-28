import { useState } from 'react';
import ImageForm from '../components/ImageForm';
import GeneratedImage from '../components/GeneratedImage';

export default function Home() {
  const [imageUrl, setImageUrl] = useState(null);

console.log("mama")
  
  const handleImageGeneration = async (prompt) => {
    console.log("prompt: " + prompt);
    try {
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      console.log("typeof(prompt) : " + typeof(prompt)); 
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      // 응답으로 받은 데이터를 로그에 출력
      console.log("응답 데이터: ", data);
      console.log("응답 데이터 URL: ", data.imageUrl);
      setImageUrl(data.imageUrl);

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

  return (
    <div>
      <ImageForm onGenerate={handleImageGeneration} />
      {imageUrl && <GeneratedImage url={imageUrl} />}
    </div>
  );
}
