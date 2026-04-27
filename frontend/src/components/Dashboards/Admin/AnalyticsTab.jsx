import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

function AnalyticsTab() {
  const [topCampaigns, setTopCampaigns] = useState([]);
  const { toast } = useToast();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const fetchTopCampaigns = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${backendUrl}/campaigns/highest-funded`);
        const data = await res.json();

        if (data.status === 'success') {
          setTopCampaigns(data.data);
        } else {
          toast({
            title: 'Error fetching campaigns',
            description: data.message || 'Something went wrong',
            variant: 'destructive',
          });
        }
      } catch (err) {
        toast({
          title: 'Error fetching campaigns',
          description: err.message,
          variant: 'destructive',
        });
      }
    };

    fetchTopCampaigns();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="bg-gray-900/70 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Top 5 Funded Campaigns</CardTitle>
          <CardDescription className="text-gray-300">
            Highest performing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCampaigns.slice(0, 5).map((campaign, index) => (
              <div
                key={campaign.campaign_id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/40"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-100 truncate">
                    {campaign.title}
                  </div>
                  <div className="text-sm text-gray-300">
                    {formatCurrency(campaign.raised_amount)} •{' '}
                    {campaign.donor_count === 1
                      ? '1 donor'
                      : `${campaign.donor_count} donors`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsTab;
