import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast.js';
import { Eye, Ban } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

const ApprovedCampaigns = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [completedCampaigns, setCompletedCampaigns] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  useEffect(() => {
    const fetchActiveAndCompletedCampaigns = async () => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(`${backendUrl}/campaigns/status/active`);
      const data = await response.json();
      if (data?.status === "success") setActiveCampaigns(data.data);

      const response2 = await fetch(`${backendUrl}/campaigns/status/completed`);
      const data2 = await response2.json();
      if (data2?.status === "success") setCompletedCampaigns(data2.data);
    };

    fetchActiveAndCompletedCampaigns();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryStyle = (category) => {
    const styles = {
      medical: 'bg-red-500/10 text-red-400 border-red-500/20',
      education: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      emergency: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      charity: 'bg-green-500/10 text-green-400 border-green-500/20',
      personal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };
    return styles[category] || 'bg-muted text-muted-foreground';
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      completed: 'secondary',
      pending: 'outline',
    };
    return variants[status] || 'outline';
  };

  const handleEyeClick = (id) => {
    navigate(`/all-campaigns/${id}`);
  };

  const filteredActive = activeCampaigns.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCompleted = completedCampaigns.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-gray-900/70 border border-gray-800 text-gray-200 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-100">Approved Campaigns</CardTitle>
            <CardDescription className="text-gray-400">
              Active and completed campaigns
            </CardDescription>
          </div>

          <input
            type="text"
            placeholder="Search campaigns..."
            className="bg-gray-800/50 border border-gray-700 text-gray-300 rounded-md px-3 py-2 w-64 focus:outline-none backdrop-blur-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader className="bg-gray-900/70 ">
            <TableRow>
              <TableHead className="text-gray-300">Campaign</TableHead>
              <TableHead className="text-gray-300">Creator</TableHead>
              <TableHead className="text-gray-300">Category</TableHead>
              <TableHead className="text-gray-300">Progress</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredActive.map((campaign) => (
              <TableRow
                key={campaign.campaign_id}
                className="border-gray-800"
              >
                <TableCell className="font-medium text-gray-100">
                  {campaign.title}
                </TableCell>

                <TableCell className="text-gray-300">
                  {campaign.creator.username}
                </TableCell>

                <TableCell>
                  <Badge className={getCategoryStyle(campaign.category)} variant="outline">
                    {campaign.category}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-300">
                      {formatCurrency(campaign.raised_amount)} / {formatCurrency(campaign.goal_amount)}
                    </div>
                    <Progress
                      value={(campaign.raised_amount / campaign.goal_amount) * 100}
                      className="h-2 bg-gray-700 [&>div]:bg-green-500"
                    />
                  </div>
                </TableCell>


                <TableCell>
                  <Badge variant={getStatusBadge(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-300 hover:bg-gray-800"
                      onClick={() => handleEyeClick(campaign.campaign_id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-300 hover:bg-gray-800"
                    >
                      {/* <Ban className="h-4 w-4" /> */}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filteredCompleted.map((campaign) => (
              <TableRow
                key={campaign.campaign_id}
                className="border-gray-800"
              >
                <TableCell className="font-medium text-gray-100">
                  {campaign.title}
                </TableCell>

                <TableCell className="text-gray-300">
                  {campaign.creator.username}
                </TableCell>

                <TableCell>
                  <Badge className={getCategoryStyle(campaign.category)} variant="outline">
                    {campaign.category}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-300">
                      {formatCurrency(campaign.raised_amount)} / {formatCurrency(campaign.goal_amount)}
                    </div>
                    <Progress
                      value={(campaign.raised_amount / campaign.goal_amount) * 100}
                      className="h-2 bg-gray-700"
                    />
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={getStatusBadge(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-300 hover:bg-gray-800"
                      onClick={() => handleEyeClick(campaign.campaign_id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-300 hover:bg-gray-800"
                    >
                      {/* <Ban className="h-4 w-4" /> */}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ApprovedCampaigns;
