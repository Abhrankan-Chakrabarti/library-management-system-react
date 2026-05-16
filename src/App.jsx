import React, { useState } from 'react';

export default function LibraryManagementSystem() {
  // --- STATE MANAGEMENT ---
  const [books, setBooks] = useState([
    { id: 1, name: 'DBMS', author: 'Korth', stock: 5, total_issued: 1 }, // Set to 1 to match initial issue
    { id: 2, name: 'C Programming', author: 'Dennis Ritchie', stock: 3, total_issued: 0 },
    { id: 3, name: 'Java', author: 'James Gosling', stock: 4, total_issued: 0 },
  ]);

  const [members, setMembers] = useState([
    { id: 1, name: 'Amit', address: 'Kolkata', fine_amt: 0 },
    { id: 2, name: 'Ravi', address: 'Delhi', fine_amt: 0 },
    { id: 3, name: 'Sita', address: 'Mumbai', fine_amt: 0 },
  ]);

  // Pre-populating with your initial SQL insert example: INSERT INTO issue(mem_id, book_no) VALUES (1, 1);
  const [issues, setIssues] = useState([
    {
      issue_no: 1,
      issue_date: new Date().toLocaleDateString(),
      mem_id: 1,
      book_no: 1,
      return_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      returned: 'No'
    }
  ]); 
  
  // --- FORM INPUT & SEARCH STATES ---
  const [issueMemberId, setIssueMemberId] = useState('');
  const [issueBookNo, setIssueBookNo] = useState('');
  const [returnIssueNo, setReturnIssueNo] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // New Search State

  const [nextIssueNo, setNextIssueNo] = useState(2); // Starts at 2 since #1 is pre-issued

  // --- ACTIONS & TRIGGERS ---

  const handleIssueBook = () => {
    const memId = parseInt(issueMemberId);
    const bookNo = parseInt(issueBookNo);

    if (!memId || !bookNo) {
      alert('Please enter both Member ID and Book Number.');
      return;
    }

    const memberExists = members.some((m) => m.id === memId);
    if (!memberExists) {
      alert(`Error: Member ID ${memId} does not exist.`);
      return;
    }

    const targetBook = books.find((b) => b.id === bookNo);
    if (!targetBook) {
      alert(`Error: Book No ${bookNo} does not exist.`);
      return;
    }

    if (targetBook.stock <= 0) {
      alert('Error: Book not available in stock.');
      return;
    }

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 10);

    const newIssue = {
      issue_no: nextIssueNo,
      issue_date: today.toLocaleDateString(),
      mem_id: memId,
      book_no: bookNo,
      return_date: dueDate.toLocaleDateString(),
      returned: 'No',
    };

    setIssues([...issues, newIssue]);
    setNextIssueNo(nextIssueNo + 1);

    // Update stock AND increment the total issued counter
    setBooks(
      books.map((b) => (b.id === bookNo ? { ...b, stock: b.stock - 1, total_issued: b.total_issued + 1 } : b))
    );

    setIssueMemberId('');
    setIssueBookNo('');
    alert(`Success: Book issued! Issue No assigned: ${nextIssueNo}`);
  };

  const handleReturnBook = () => {
    const issNo = parseInt(returnIssueNo);

    if (!issNo) {
      alert('Please enter an Issue Number.');
      return;
    }

    const targetIssue = issues.find((i) => i.issue_no === issNo);
    if (!targetIssue) {
      alert(`Error: Issue Number ${issNo} not found.`);
      return;
    }

    if (targetIssue.returned !== 'No') {
      alert('Error: This transaction is already marked as returned.');
      return;
    }

    const todayStr = new Date().toLocaleDateString();

    setIssues(
      issues.map((i) => i.issue_no === issNo ? { ...i, returned: todayStr } : i)
    );

    setBooks(
      books.map((b) => b.id === targetIssue.book_no ? { ...b, stock: b.stock + 1 } : b)
    );

    setReturnIssueNo('');
    alert(`Success: Book from Issue No ${issNo} has been returned!`);
  };

  // --- FILTERED BOOKS LOGIC ---
  const filteredBooks = books.filter((book) =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          📚 Library Management System Dashboard
        </h1>

        {/* Search Bar Feature */}
        <div className="mb-6 max-w-md mx-auto">
          <input
            type="text"
            placeholder="🔍 Search books by name or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Books Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Available Books</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">No</th>
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Author</th>
                  <th className="p-2 border">Stock</th>
                  <th className="p-2 border">Total Issued</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="text-center hover:bg-gray-50">
                    <td className="p-2 border">{book.id}</td>
                    <td className="p-2 border font-medium">{book.name}</td>
                    <td className="p-2 border">{book.author}</td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded text-sm ${book.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {book.stock}
                      </span>
                    </td>
                    <td className="p-2 border font-semibold text-blue-600">{book.total_issued}🔄</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Members Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Members List</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Address</th>
                  <th className="p-2 border">Fine</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="text-center hover:bg-gray-50">
                    <td className="p-2 border">{member.id}</td>
                    <td className="p-2 border font-medium">{member.name}</td>
                    <td className="p-2 border">{member.address}</td>
                    <td className="p-2 border text-red-600 font-semibold">₹{member.fine_amt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Issue Book (Trigger Sync)</h2>
            <div className="flex flex-col gap-4">
              <input
                type="number"
                placeholder="Enter Member ID (e.g., 1)"
                value={issueMemberId}
                onChange={(e) => setIssueMemberId(e.target.value)}
                className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Enter Book No (e.g., 1)"
                value={issueBookNo}
                onChange={(e) => setIssueBookNo(e.target.value)}
                className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleIssueBook}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 font-semibold transition"
              >
                Execute Issue Action
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Return Book (Trigger Sync)</h2>
            <div className="flex flex-col gap-4">
              <input
                type="number"
                placeholder="Enter Issue No (Look at registry below)"
                value={returnIssueNo}
                onChange={(e) => setReturnIssueNo(e.target.value)}
                className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleReturnBook}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-3 font-semibold transition"
              >
                Execute Return Action
              </button>
            </div>
          </div>
        </div>

        {/* Live Transaction Log Registry Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">📜 Live Issue Table (`SELECT * FROM issue;`)</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Issue No</th>
                <th className="p-2 border">Issue Date</th>
                <th className="p-2 border">Mem ID</th>
                <th className="p-2 border">Book No</th>
                <th className="p-2 border">Due Date</th>
                <th className="p-2 border">Returned On</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((i) => (
                <tr key={i.issue_no} className="text-center hover:bg-gray-50">
                  <td className="p-2 border font-bold text-blue-600">#{i.issue_no}</td>
                  <td className="p-2 border text-sm">{i.issue_date}</td>
                  <td className="p-2 border">{i.mem_id}</td>
                  <td className="p-2 border">{i.book_no}</td>
                  <td className="p-2 border text-sm font-medium text-orange-600">{i.return_date}</td>
                  <td className="p-2 border">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${i.returned !== 'No' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {i.returned}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
