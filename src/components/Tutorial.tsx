import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useLanguage } from './LanguageProvider';
import { Brain, BookOpen, Settings, FileUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function Tutorial() {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TutorialStep[] = [
    {
      title: t('tutorial.welcome.title'),
      description: t('tutorial.welcome.description'),
      icon: <Brain className="h-8 w-8 text-primary" />
    },
    {
      title: t('tutorial.createDeck.title'),
      description: t('tutorial.createDeck.description'),
      icon: <BookOpen className="h-8 w-8 text-primary" />
    },
    {
      title: t('tutorial.addCards.title'),
      description: t('tutorial.addCards.description'),
      icon: <FileUp className="h-8 w-8 text-primary" />
    },
    {
      title: t('tutorial.study.title'),
      description: t('tutorial.study.description'),
      icon: <Brain className="h-8 w-8 text-primary" />
    },
    {
      title: t('tutorial.customize.title'),
      description: t('tutorial.customize.description'),
      icon: <Settings className="h-8 w-8 text-primary" />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tutorial-completed', 'true');
    window.location.reload();
  };

  const handleFinish = () => {
    localStorage.setItem('tutorial-completed', 'true');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn(
        "w-full max-w-2xl animate-in fade-in-50 slide-in-from-bottom-4 duration-500",
        "border-2 border-primary/20 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"
      )}>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {steps[currentStep].title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentStep ? "w-4 bg-primary" : "w-2 bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center p-4">
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-20 animate-pulse" />
              <div className="relative h-full w-full rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center border-2 border-primary/20">
                {steps[currentStep].icon}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center leading-relaxed text-lg">
            {steps[currentStep].description}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('tutorial.skip')}
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="border-2 hover:bg-primary/10"
              >
                {t('tutorial.previous')}
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {currentStep === steps.length - 1 ? t('tutorial.finish') : t('tutorial.next')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 