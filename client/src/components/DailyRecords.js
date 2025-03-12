import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Card, Spinner, Alert, Pagination, Form, Row, Col, Button } from "react-bootstrap";
import { format } from "date-fns";

const DailyRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 0,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://localhost:5000/api/records/daily", {
        params: { page, limit, startDate, endDate }, // Pass date range
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(response.data.records);
      setPagination({
        totalRecords: response.data.pagination.totalRecords,
        totalPages: response.data.pagination.totalPages,
      });
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching daily records");
      console.error("Error fetching daily records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, startDate, endDate]); // Re-fetch when filters change

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1); // Reset to the first page when applying filters
    fetchData();
  };

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/records/export/${format}`, {
        params: { startDate, endDate }, // Pass date range
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // Important for file downloads
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `daily_records.${format}`); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      alert(`Error exporting to ${format}`);
    }
  };

  return (
    <Card className="shadow-sm mt-4">
      <Card.Body>
        <Card.Title className="fw-bold mb-4">Daily Records</Card.Title>

        {/* Date Range Filter */}
        <Form onSubmit={handleFilter}>
          <Row className="mb-3">
            <Col>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
            </Col>
            <Col>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </Col>
            <Col>
              <Button type="submit" variant="primary">
                Apply Filter
              </Button>
            </Col>
          </Row>
        </Form>

        {/* Export Buttons */}
        <div className="mb-3">
          <Button variant="success" onClick={() => handleExport("excel")} className="me-2">
            Export to Excel
          </Button>
          <Button variant="primary" onClick={() => handleExport("csv")}>
            Export to CSV
          </Button>
        </div>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Date</th>
              <th>Petrol Remaining (L)</th>
              <th>Diesel Remaining (L)</th>
              <th>Petrol Sold (L)</th>
              <th>Diesel Sold (L)</th>
              <th>Total Sales (Ksh)</th>
              <th>Total Expenses (Ksh)</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No records found.
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr key={index}>
                  <td>{format(new Date(record.date), "yyyy-MM-dd")}</td>
                  <td>{record.petrolRemaining}</td>
                  <td>{record.dieselRemaining}</td>
                  <td>{record.petrolSold}</td>
                  <td>{record.dieselSold}</td>
                  <td>{record.totalSales}</td>
                  <td>{record.totalExpenses}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* Pagination Controls */}
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            />
            <Pagination.Item active>{page}</Pagination.Item>
            <Pagination.Next
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
            />
          </Pagination>
        </div>

        {/* Pagination Summary */}
        <div className="text-center mt-2">
          Showing {records.length} of {pagination.totalRecords} records (Page {page} of{" "}
          {pagination.totalPages})
        </div>
      </Card.Body>
    </Card>
  );
};

export default DailyRecords;