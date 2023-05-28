import { useState } from 'react';

export default function ImageForm({ onGenerate }) {

  const [prompt, setPrompt] = useState(''); // 추가된 코드
  const [imageUrl, setImageUrl] = useState(null); // 추가된 코드


  const handleSubmit = (event) => {
    event.preventDefault();
    onGenerate(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Prompt:
        <input
          type="text"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </label>
      <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
        Generate
      </button>
    </form>
  );
}
