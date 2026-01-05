import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, PowerUpType } from '@/lib/gameTypes';

interface PowerUpShopProps {
  user: User;
  onPurchase: (type: PowerUpType) => void;
  powerUps: {
    type: PowerUpType;
    name: string;
    description: string;
    cost: number;
    icon: React.ElementType;
  }[];
}

const PowerUpShop = ({ user, onPurchase, powerUps }: PowerUpShopProps) => {
  return (
    <Card className="bg-background/80 backdrop-blur-sm border-border/50 p-2 w-full md:w-64">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {powerUps.map(powerUp => {
            const Icon = powerUp.icon;
            return (
              <Button
                key={powerUp.type}
                variant="outline"
                size="icon"
                className="relative h-10 w-10 border-border/50"
                onClick={() => onPurchase(powerUp.type)}
                disabled={user.stxBalance < powerUp.cost}
                title={`${powerUp.name} - ${powerUp.cost} STX. ${powerUp.description}`}
              >
                <Icon className="w-5 h-5" />
                {user.powerUps[powerUp.type]?.count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-mono">
                    {user.powerUps[powerUp.type].count}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
        <div className="text-right">
            <p className="text-xs text-muted-foreground font-mono">Balance</p>
            <p className="font-bold font-mono text-sm text-foreground">{user.stxBalance} STX</p>
        </div>
      </div>
    </Card>
  );
};

export default PowerUpShop;
