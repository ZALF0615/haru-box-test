import { Configuration, OpenAIApi } from "openai";

// OpenAI API 환경 변수 설정
const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async (req, res) => {
    console.log("slpy");
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }


    const { prompt } = req.body;
  
    // prompt가 정의되어 있는지 확인하고 그 값을 로그에 출력
    console.log("받은 prompt: ", prompt);
  
    try {
      const imageResp = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: "800x600",
      });
  
      // 응답 상태와 데이터를 로그에 출력
      console.log("OpenAI 응답 상태: ", imageResp.status);
      console.log("OpenAI 응답 데이터 URL: ", imageResp.data.data[0].url);

      res.status(200).json({
        imageUrl: imageResp.data.data[0].url,
      });
    } catch (error) {
      console.error("이미지 생성 오류: ", error);
  
      // 상세한 오류 정보를 로그에 출력
      console.error("오류 메시지: ", error.message);
      console.error("오류 스택: ", error.stack);
  
      res.status(500).json({ error: "Error generating image" });
    }
  };
  