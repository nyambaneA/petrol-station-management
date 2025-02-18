import { useState } from 'react';


function SalesInput() {
    const [fuelType, setFuelType] = useState("");
    const [volumeSold, setVolumeSold] = useState("");
    const [amount, setAmount] = useState("");
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      await fetch("http://localhost:5000/api/sales/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: localStorage.getItem("token") },
        body: JSON.stringify({ fuelType, volumeSold, amount }),
      });
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Fuel Type" value={fuelType} onChange={(e) => setFuelType(e.target.value)} />
        <input type="number" placeholder="Volume Sold (L)" value={volumeSold} onChange={(e) => setVolumeSold(e.target.value)} />
        <input type="number" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button type="submit">Record Sale</button>
      </form>
    );
  }
  
  export default SalesInput;