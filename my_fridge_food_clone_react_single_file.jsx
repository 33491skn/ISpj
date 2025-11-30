import React, { useEffect, useState } from "react";

// MyFridgeFood-style single-file React app
// - Tailwind CSS classes are used (assumes Tailwind is available in the project)
// - Copy this file into a Create React App / Vite project (e.g., src/App.jsx)
// - Features: ingredient checklist, recipe matching, add ingredient, add recipe, save to localStorage

const SAMPLE_RECIPES = [
  {
    id: 1,
    title: "ไข่เจียวหอมใหญ่ (Thai omelette with onion)",
    ingredients: ["egg", "onion", "salt", "oil"],
    minutes: 10,
    servings: 1,
    steps: [
      "หั่นหอมใหญ่ เตรียมไข่ ตีให้เข้ากัน ใส่เกลือเล็กน้อย",
      "ตั้งกระทะ ใส่น้ำมัน เทไข่ ใส่หอมใหญ่ ผัดจนสุก ขึ้นจาน"
    ]
  },
  {
    id: 2,
    title: "Pasta Aglio e Olio",
    ingredients: ["spaghetti", "garlic", "olive oil", "chili flakes", "salt"],
    minutes: 15,
    servings: 2,
    steps: ["ต้มพาสต้าให้สุก ตั้งกระทะผัดกระเทียมกับน้ำมัน ปรุงรส ผสมพาสต้า"]
  },
  {
    id: 3,
    title: "Fried Rice (ข้าวผัด)",
    ingredients: ["rice", "egg", "soy sauce", "green onion", "oil"],
    minutes: 12,
    servings: 2,
    steps: ["ตั้งกระทะ ใส่น้ำมัน ผัดไข่ ใส่ข้าว ใส่ซีอิ๊วและต้นหอมผัดให้เข้ากัน"]
  }
];

function normalizeIng(s) {
  return s.trim().toLowerCase();
}

export default function App() {
  const [available, setAvailable] = useState([]); // user's ingredients
  const [inputIng, setInputIng] = useState("");
  const [recipes, setRecipes] = useState(SAMPLE_RECIPES);
  const [query, setQuery] = useState("");
  const [filterFullOnly, setFilterFullOnly] = useState(false);

  // load from localStorage
  useEffect(() => {
    const sAv = localStorage.getItem("mf_available");
    const sRec = localStorage.getItem("mf_recipes");
    if (sAv) setAvailable(JSON.parse(sAv));
    if (sRec) setRecipes(JSON.parse(sRec));
  }, []);
  useEffect(() => {
    localStorage.setItem("mf_available", JSON.stringify(available));
  }, [available]);
  useEffect(() => {
    localStorage.setItem("mf_recipes", JSON.stringify(recipes));
  }, [recipes]);

  function addIngredient() {
    const n = normalizeIng(inputIng);
    if (!n) return;
    if (!available.includes(n)) setAvailable(prev => [...prev, n]);
    setInputIng("");
  }

  function removeIngredient(ing) {
    setAvailable(prev => prev.filter(i => i !== ing));
  }

  // simple matcher: counts how many recipe ingredients are present
  function matchRecipe(recipe) {
    const required = recipe.ingredients.map(normalizeIng);
    const matched = required.filter(r => available.includes(r));
    const missing = required.filter(r => !available.includes(r));
    const score = Math.round((matched.length / required.length) * 100);
    return { matched, missing, score };
  }

  function addSampleRecipe() {
    const newR = {
      id: Date.now(),
      title: "New Recipe",
      ingredients: ["ingredient1", "ingredient2"],
      minutes: 10,
      servings: 1,
      steps: ["Step 1", "Step 2"]
    };
    setRecipes(prev => [newR, ...prev]);
  }

  function addRecipeFromForm(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const title = fd.get("title").trim();
    const ingredients = fd.get("ingredients")
      .split(",")
      .map(s => normalizeIng(s))
      .filter(Boolean);
    const minutes = Number(fd.get("minutes") || 0);
    if (!title || ingredients.length === 0) return alert("กรุณากรอกชื่อและวัตถุดิบ (ด้วยเครื่องหมาย , )");
    const newR = { id: Date.now(), title, ingredients, minutes, servings: 1, steps: ["ดูรายละเอียดในสูตร"] };
    setRecipes(prev => [newR, ...prev]);
    e.target.reset();
  }

  const results = recipes
    .map(r => ({ ...r, ...matchRecipe(r) }))
    .filter(r => r.title.toLowerCase().includes(query.toLowerCase()))
    .filter(r => (filterFullOnly ? r.missing.length === 0 : true))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">MyFridgeFood — แบบย่อ (Clone)</h1>
          <div className="text-sm text-gray-600">ตัวอย่างโค้ด: ปรับแต่งได้</div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Ingredients */}
          <section className="md:col-span-1 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">วัตถุดิบที่มี</h2>
            <div className="flex gap-2 mb-3">
              <input
                value={inputIng}
                onChange={e => setInputIng(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addIngredient()}
                placeholder="พิมพ์วัตถุดิบแล้วกด Enter หรือคลิก +"
                className="flex-1 border rounded px-3 py-2"
              />
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={addIngredient}>
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {available.length === 0 && <div className="text-gray-500">ยังไม่มีวัตถุดิบ</div>}
              {available.map(ing => (
                <button
                  key={ing}
                  onClick={() => removeIngredient(ing)}
                  className="px-2 py-1 border rounded-full text-sm bg-gray-100 hover:bg-red-50"
                >
                  {ing} ✕
                </button>
              ))}
            </div>

            <hr className="my-4" />

            <div>
              <h3 className="font-medium">จัดการสูตร</h3>
              <div className="mt-2 text-sm text-gray-600">เพิ่มสูตรจากฟอร์มด้านล่างหรือใช้ปุ่มเพื่อเพิ่มตัวอย่าง</div>
              <button onClick={addSampleRecipe} className="mt-2 px-3 py-2 bg-green-600 text-white rounded">
                เพิ่มสูตรตัวอย่าง
              </button>

              <form onSubmit={addRecipeFromForm} className="mt-3">
                <input name="title" placeholder="ชื่อสูตร" className="w-full border px-2 py-1 mb-2 rounded" />
                <input
                  name="ingredients"
                  placeholder="วัตถุดิบ คั่นด้วย , เช่น egg, onion, rice"
                  className="w-full border px-2 py-1 mb-2 rounded"
                />
                <input name="minutes" type="number" placeholder="เวลา(นาที)" className="w-full border px-2 py-1 mb-2 rounded" />
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">
                  เพิ่มสูตรใหม่
                </button>
              </form>
            </div>
          </section>

          {/* Center: Results */}
          <section className="md:col-span-2">
            <div className="bg-white p-4 rounded shadow mb-4">
              <div className="flex items-center gap-3">
                <input
                  className="flex-1 border px-3 py-2 rounded"
                  placeholder="ค้นหาชื่อสูตร"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={filterFullOnly} onChange={e => setFilterFullOnly(e.target.checked)} />
                  <span className="text-sm">แสดงเฉพาะสูตรที่ทำได้เลย</span>
                </label>
              </div>
            </div>

            <div className="grid gap-4">
              {results.length === 0 && (
                <div className="bg-white p-6 rounded shadow text-center text-gray-600">ไม่พบสูตรที่ตรงกับเงื่อนไข</div>
              )}

              {results.map(r => (
                <article key={r.id} className="bg-white p-4 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{r.title}</h3>
                    <div className="text-sm text-gray-600">เวลา ~{r.minutes} นาที • เสิร์ฟ {r.servings}</div>
                    <div className="mt-2 text-sm">
                      <strong>วัตถุดิบ:</strong> {r.ingredients.join(", ")}
                    </div>
                    {r.missing.length > 0 ? (
                      <div className="mt-2 text-sm text-red-600">ขาด: {r.missing.join(", ")}</div>
                    ) : (
                      <div className="mt-2 text-sm text-green-700">ทำได้เลย — วัตถุดิบครบ</div>
                    )}
                  </div>

                  <div className="mt-3 md:mt-0 md:text-right">
                    <div className="text-sm text-gray-500 mb-2">ความตรงกัน</div>
                    <div className="text-2xl font-bold">{r.score}%</div>
                    <div className="mt-2">
                      <button
                        onClick={() => alert("Steps:\n" + (r.steps || []).join("\n"))}
                        className="px-3 py-2 bg-blue-600 text-white rounded"
                      >
                        ดูสูตร
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer className="mt-8 text-center text-gray-500 text-sm">ตัวอย่างโปรเจค — ปรับแต่งต่อได้ (ไม่ใช่โค้ดของเว็บไซต์ myfridgefood.com)</footer>
      </div>
    </div>
  );
}
