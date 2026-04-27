import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast.js';

const TransactionHistory = () => {
  const { toast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(
        `${backendUrl}/payments/transaction-history?page=${page}&limit=${limit}`
      );
      const data = await response.json();

      if (data.status === "success") {
        setTransactions(data.data);
        setTotalPages(data.total_pages);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="bg-gray-900/70 border border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-100">Transaction History</CardTitle>
        <CardDescription className="text-gray-300">All platform transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-200">Type</TableHead>
              <TableHead className="text-gray-200">User</TableHead>
              <TableHead className="text-gray-200">Campaign</TableHead>
              <TableHead className="text-gray-200">Amount</TableHead>
              <TableHead className="text-gray-200">Date & Time</TableHead>
              <TableHead className="text-gray-200">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <TableRow key={index} className="hover:bg-gray-800/40">
                  <TableCell>
                    <Badge variant="outline">{transaction.type}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-200">
                    {transaction.user ? transaction.user.name : "N/A"}
                  </TableCell>
                  <TableCell className="text-gray-200">
                    {transaction.campaign ? transaction.campaign.title : "N/A"}
                  </TableCell>
                  <TableCell className="text-gray-200">{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell className="text-gray-200">{transaction.date_time}</TableCell>
                  <TableCell>
                    <Badge variant="default">{transaction.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-300 py-6">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <Button 
            variant="outline" 
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </Button>

          <p className="text-sm text-gray-300">
            Page <span className="font-semibold text-gray-100">{page}</span> of{" "}
            <span className="font-semibold text-gray-100">{totalPages}</span>
          </p>

          <Button 
            variant="outline" 
            disabled={page === totalPages}
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
