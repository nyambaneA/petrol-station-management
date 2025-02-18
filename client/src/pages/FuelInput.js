import { useState } from "react";

function FuelInput() {
  const [fuelType, setFuelType] = useState("");
  const [volume, setVolume] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/fuel/add", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: localStorage.getItem("token") },
      body: JSON.stringify({ type: fuelType, volume }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Fuel Type" value={fuelType} onChange={(e) => setFuelType(e.target.value)} />
      <input type="number" placeholder="Volume (L)" value={volume} onChange={(e) => setVolume(e.target.value)} />
      <button type="submit">Add Fuel</button>
    </form>
  );
}

export default FuelInput;
