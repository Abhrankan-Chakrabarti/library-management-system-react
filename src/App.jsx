import React, { useState } from 'react';

export default function LibraryManagementSystem() {
  // =========================
  // BOOK TABLE
  // =========================
  const [books, setBooks] = useState([
    {
      id: 1,
      name: 'DBMS',
      author: 'Korth',
      stock: 5,
      totalIssued: 0,
    },
    {
      id: 2,
      name: 'C Programming',
      author: 'Dennis Ritchie',
      stock: 3,
      totalIssued: 0,
    },
    {
      id: 3,
      name: 'Java',
      author: 'James Gosling',
      stock: 4,
      totalIssued: 0,
    },
  ]);

  // =========================
  // MEMBER TABLE
  // =========================
  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Amit',
      address: 'Kolkata',
      fine_amt: 0,
    },
    {
      id: 2,
      name: 'Ravi',
      address: 'Delhi',
      fine_amt: 0,
    },
    {
      id: 3,
      name: 'Sita',
      address: 'Mumbai',
      fine_amt: 0,
    },
  ]);

  // =========================
  // ISSUE TABLE
  // =========================
  const [issues, setIssues] = useState([]);

  // =========================
  // FORM STATES
  // =========================
  const [issueMemberId, setIssueMemberId] = useState('');
  const [issueBookNo, setIssueBookNo] = useState('');
  const [returnIssueNo, setReturnIssueNo] = useState('');
  const [search, setSearch] = useState('');

  // =========================
  // SEQUENCE
  // =========================
  const [nextIssueNo, setNextIssueNo] = useState(1);

  // =========================
  // DATE FORMATTER
  // =========================
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  // =========================
  // ISSUE BOOK
  // =========================
  const handleIssueBook = () => {
    const memId = parseInt(issueMemberId);
    const bookNo = parseInt(issueBookNo);

    // Validation
    if (!memId || !bookNo) {
      alert('Please enter both Member ID and Book Number.');
      return;
    }

    // Member existence check
    const memberExists = members.some((m) => m.id === memId);

    if (!memberExists) {
      alert(`Error: Member ID ${memId} does not exist.`);
      return;
    }

    // Book existence check
    const targetBook = books.find((b) => b.id === bookNo);

    if (!targetBook) {
      alert(`Error: Book No ${bookNo} does not exist.`);
      return;
    }

    // Stock check
    if (targetBook.stock <= 0) {
      alert('Error: Book not available in stock.');
      return;
    }

    // Duplicate active issue check
    const alreadyIssued = issues.some(
      (i) =>
        i.mem_id === memId &&
        i.book_no === bookNo &&
        i.returned === null
    );

    if (alreadyIssued) {
      alert('Error: This member already has this book issued.');
      return;
    }

    // Dates
    const today = new Date();

    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 10);

    // Create Issue Record
    const newIssue = {
      issue_no: nextIssueNo,
      issue_date: today,
      mem_id: memId,
      book_no: bookNo,
      return_date: dueDate,
      returned: null,
    };

    // Insert into ISSUE table
    setIssues((prev) => [...prev, newIssue]);

    // Sequence increment
    setNextIssueNo((prev) => prev + 1);

    // Update BOOK table
    setBooks((prevBooks) =>
      prevBooks.map((b) =>
        b.id === bookNo
          ? {
              ...b,
              stock: b.stock - 1,
              totalIssued: b.totalIssued + 1,
            }
          : b
      )
    );

    // Clear form
    setIssueMemberId('');
    setIssueBookNo('');

    alert(
      `Success: Book issued successfully!\nIssue No: ${nextIssueNo}`
    );
  };

  // =========================
  // RETURN BOOK
  // =========================
  const handleReturnBook = () => {
    const issNo = parseInt(returnIssueNo);

    if (!issNo) {
      alert('Please enter an Issue Number.');
      return;
    }

    const targetIssue = issues.find(
      (i) => i.issue_no === issNo
    );

    if (!targetIssue) {
      alert(`Error: Issue Number ${issNo} not found.`);
      return;
    }

    if (targetIssue.returned !== null) {
      alert('Error: Book already returned.');
      return;
    }

    const returnDate = new Date();

    // Fine Calculation
    const issueDate = new Date(targetIssue.issue_date);

    const diffTime = returnDate - issueDate;

    const totalDays = Math.floor(
      diffTime / (1000 * 60 * 60 * 24)
    );

    let fineApplied = 0;

    if (totalDays > 20) {
      fineApplied = (totalDays - 20) * 2;
    }

    // Update ISSUE table
    setIssues((prevIssues) =>
      prevIssues.map((i) =>
        i.issue_no === issNo
          ? {
              ...i,
              returned: returnDate,
            }
          : i
      )
    );

    // Increase stock
    setBooks((prevBooks) =>
      prevBooks.map((b) =>
        b.id === targetIssue.book_no
          ? {
              ...b,
              stock: b.stock + 1,
            }
          : b
      )
    );

    // Update member fine
    if (fineApplied > 0) {
      setMembers((prevMembers) =>
        prevMembers.map((m) =>
          m.id === targetIssue.mem_id
            ? {
                ...m,
                fine_amt: m.fine_amt + fineApplied,
              }
            : m
        )
      );
    }

    setReturnIssueNo('');

    alert(
      `Book returned successfully!\nFine Applied: ₹${fineApplied}`
    );
  };

  // =========================
  // FILTERED BOOKS
  // =========================
  const filteredBooks = books.filter((book) =>
    book.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          📚 Library Management System
        </h1>

        {/* SEARCH */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <input
            type="text"
            placeholder="Search Book..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl p-3"
          />
        </div>

        {/* BOOKS + MEMBERS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BOOK TABLE */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              📘 Books
            </h2>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Book No</th>
                  <th className="border p-2">Book</th>
                  <th className="border p-2">Author</th>
                  <th className="border p-2">Stock</th>
                  <th className="border p-2">Total Issued</th>
                </tr>
              </thead>

              <tbody>
                {filteredBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="text-center hover:bg-gray-50"
                  >
                    <td className="border p-2">{book.id}</td>

                    <td className="border p-2 font-medium">
                      {book.name}
                    </td>

                    <td className="border p-2">
                      {book.author}
                    </td>

                    <td className="border p-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          book.stock > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {book.stock}
                      </span>
                    </td>

                    <td className="border p-2 font-semibold text-blue-700">
                      {book.totalIssued}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MEMBER TABLE */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              👥 Members
            </h2>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Member ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Address</th>
                  <th className="border p-2">Fine</th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="text-center hover:bg-gray-50"
                  >
                    <td className="border p-2">{member.id}</td>

                    <td className="border p-2 font-medium">
                      {member.name}
                    </td>

                    <td className="border p-2">
                      {member.address}
                    </td>

                    <td className="border p-2 text-red-600 font-semibold">
                      ₹{member.fine_amt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FORMS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* ISSUE FORM */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              📖 Issue Book
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="number"
                placeholder="Enter Member ID"
                value={issueMemberId}
                onChange={(e) =>
                  setIssueMemberId(e.target.value)
                }
                className="border rounded-xl p-3"
              />

              <input
                type="number"
                placeholder="Enter Book No"
                value={issueBookNo}
                onChange={(e) =>
                  setIssueBookNo(e.target.value)
                }
                className="border rounded-xl p-3"
              />

              <button
                onClick={handleIssueBook}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 font-semibold"
              >
                Issue Book
              </button>
            </div>
          </div>

          {/* RETURN FORM */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              🔄 Return Book
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="number"
                placeholder="Enter Issue No"
                value={returnIssueNo}
                onChange={(e) =>
                  setReturnIssueNo(e.target.value)
                }
                className="border rounded-xl p-3"
              />

              <button
                onClick={handleReturnBook}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-3 font-semibold"
              >
                Return Book
              </button>
            </div>
          </div>
        </div>

        {/* ISSUE TABLE */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            📜 Issue Registry
          </h2>

          {issues.length === 0 ? (
            <p className="text-center text-gray-500 italic">
              No books issued yet.
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Issue No</th>
                  <th className="border p-2">Issue Date</th>
                  <th className="border p-2">Member ID</th>
                  <th className="border p-2">Book No</th>
                  <th className="border p-2">Due Date</th>
                  <th className="border p-2">Returned</th>
                </tr>
              </thead>

              <tbody>
                {issues.map((issue) => (
                  <tr
                    key={issue.issue_no}
                    className="text-center hover:bg-gray-50"
                  >
                    <td className="border p-2 font-bold text-blue-700">
                      #{issue.issue_no}
                    </td>

                    <td className="border p-2">
                      {formatDate(issue.issue_date)}
                    </td>

                    <td className="border p-2">
                      {issue.mem_id}
                    </td>

                    <td className="border p-2">
                      {issue.book_no}
                    </td>

                    <td className="border p-2 text-orange-600 font-medium">
                      {formatDate(issue.return_date)}
                    </td>

                    <td className="border p-2">
                      {issue.returned ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                          {formatDate(issue.returned)}
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}