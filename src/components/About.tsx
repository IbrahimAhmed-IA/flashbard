import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Brain, Github, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import { Button } from './ui/button';

const About = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">{t('about.title')}</h2>

      <Card className="overflow-hidden border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
          <CardTitle className="text-blue-700 dark:text-blue-300">{t('about.appInfo')}</CardTitle>
          <CardDescription>
            {t('about.appDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <Brain className="h-9 w-9 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('app.name')}
            </h3>
            <p className="text-sm text-center text-muted-foreground max-w-md">
              {t('about.appLongDescription')}
            </p>
          </div>

          <div className="grid gap-4 pt-4 border-t">
            <div className="flex items-center">
              <div className={`rounded-full bg-blue-100 dark:bg-blue-900/30 p-2 ${isRTL ? 'ml-3' : 'mr-3'}`}>
                <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{t('about.version')}</h4>
                <p className="text-sm text-muted-foreground">2.0.0</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-b">
          <CardTitle className="text-purple-700 dark:text-purple-300">{t('about.creatorInfo')}</CardTitle>
          <CardDescription>
            {t('about.creatorDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('about.developer')}</h3>
          <p className="text-base mb-6">Ibrahim Ahmed Mohamed Abdelsalam</p>

          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className={`h-5 w-5 text-purple-600 dark:text-purple-400 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <span className="text-sm">ibrahimahmed20u10@gmail.com</span>
            </div>

            <div className="flex items-center">
              <ExternalLink className={`h-5 w-5 text-purple-600 dark:text-purple-400 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <a
                href="https://shorturl.at/2uNhH"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('about.freelancerProfile')}
              </a>
            </div>
          </div>

          <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border">
            <p className="text-sm text-center text-purple-800 dark:text-purple-300 font-medium">
              {t('about.contactMessage')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-2 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b">
          <CardTitle className="text-green-700 dark:text-green-300">{t('about.features')}</CardTitle>
          <CardDescription>
            {t('about.featuresDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ul className={`space-y-3 ${isRTL ? 'pr-5' : 'pl-5'} list-disc`}>
            <li className="text-sm">{t('about.feature1')}</li>
            <li className="text-sm">{t('about.feature2')}</li>
            <li className="text-sm">{t('about.feature3')}</li>
            <li className="text-sm">{t('about.feature4')}</li>
            <li className="text-sm">{t('about.feature5')}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
