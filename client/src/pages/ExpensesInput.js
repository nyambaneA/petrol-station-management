import { useState } from 'react';


function ExpensesInput() {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      await fetch("http://localhost:5000/api/expenses/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: localStorage.getItem("token") },
        body: JSON.stringify({ description, amount }),
      });
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Expense Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="number" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button type="submit">Record Expense</button>
      </form>
    );
  }
  
  export default ExpensesInput;