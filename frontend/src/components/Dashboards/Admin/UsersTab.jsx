import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const UsersTab = () => {
  const [creators, setCreators] = useState([]);
  const [donors, setDonors] = useState([]);

  const [creatorPage, setCreatorPage] = useState(1);
  const [creatorTotalPages, setCreatorTotalPages] = useState(1);

  const [donorPage, setDonorPage] = useState(1);
  const [donorTotalPages, setDonorTotalPages] = useState(1);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const perPage = 5;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // Fetch creators
  const fetchCreators = async (page = 1) => {
    try {
      const res = await fetch(`${backendUrl}/campaigns/get-creators?page=${page}&per_page=${perPage}`);
      const data = await res.json();
      if (data.status === "success") {
        setCreators(data.data);
        setCreatorPage(data.page);
        setCreatorTotalPages(data.total_pages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch donors
  const fetchDonors = async (page = 1) => {
    try {
      const res = await fetch(`${backendUrl}/campaigns/get-donors?page=${page}&per_page=${perPage}`);
      const data = await res.json();
      if (data.status === "success") {
        setDonors(data.data);
        setDonorPage(data.page);
        setDonorTotalPages(data.total_pages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCreators(creatorPage); }, [creatorPage]);
  useEffect(() => { fetchDonors(donorPage); }, [donorPage]);

  return (
    <>
      {/* Creators */}
      <Card className="mb-6 bg-gray-900/70 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Campaign Creators</CardTitle>
          <CardDescription className="text-gray-300">Registered creators and their statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-200">Creator</TableHead>
                <TableHead className="text-gray-200">Campaigns</TableHead>
                <TableHead className="text-gray-200">Total Raised</TableHead>
                <TableHead className="text-gray-200">Join Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creators.map((creator) => (
                <TableRow key={creator.creator_id} className="hover:bg-gray-800/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={creator.profile_image} />
                        <AvatarFallback>{creator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-100">{creator.name}</div>
                        <div className="text-sm text-gray-300">{creator.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-200">{creator.campaigns}</TableCell>
                  <TableCell className="text-gray-200">{formatCurrency(creator.total_raised)}</TableCell>
                  <TableCell className="text-gray-200">{formatDate(creator.join_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination */}
          <div className="flex justify-end gap-2 mt-2">
            <Button size="sm" variant="outline" disabled={creatorPage === 1} onClick={() => setCreatorPage(prev => prev - 1)}>
              <ChevronLeft /> Prev
            </Button>
            <Button size="sm" variant="outline" disabled={creatorPage === creatorTotalPages} onClick={() => setCreatorPage(prev => prev + 1)}>
              Next <ChevronRight />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Donors */}
      <Card className="bg-gray-900/70 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Donors</CardTitle>
          <CardDescription className="text-gray-300">Registered donors and their contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-200">Donor</TableHead>
                <TableHead className="text-gray-200">Total Donations</TableHead>
                <TableHead className="text-gray-200">Campaigns Supported</TableHead>
                <TableHead className="text-gray-200">Join Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donors.map((donor) => (
                <TableRow key={donor.user_id} className="hover:bg-gray-800/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={donor.profile_image} />
                        <AvatarFallback>{donor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-100">{donor.name}</div>
                        <div className="text-sm text-gray-300">{donor.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-200">{formatCurrency(donor.total_donations)}</TableCell>
                  <TableCell className="text-gray-200">{donor.campaigns_supported}</TableCell>
                  <TableCell className="text-gray-200">{formatDate(donor.join_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination */}
          <div className="flex justify-end gap-2 mt-2">
            <Button size="sm" variant="outline" disabled={donorPage === 1} onClick={() => setDonorPage(prev => prev - 1)}>
              <ChevronLeft /> Prev
            </Button>
            <Button size="sm" variant="outline" disabled={donorPage === donorTotalPages} onClick={() => setDonorPage(prev => prev + 1)}>
              Next <ChevronRight />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default UsersTab;
