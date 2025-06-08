import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  EyeOff,
  Database,
  Key,
  Globe,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface EnvVariable {
  key: string;
  value: string;
  isValid: boolean;
  isRequired: boolean;
  description: string;
  placeholder: string;
  validationPattern?: RegExp;
  validationMessage?: string;
}

export default function SetupPage() {
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>([
    {
      key: 'VITE_SUPABASE_URL',
      value: '',
      isValid: false,
      isRequired: true,
      description: 'Your Supabase project URL. This is the unique URL for your Supabase project.',
      placeholder: 'https://your-project-id.supabase.co',
      validationPattern: /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/,
      validationMessage: 'Must be a valid Supabase URL (https://your-project-id.supabase.co)'
    },
    {
      key: 'VITE_SUPABASE_ANON_KEY',
      value: '',
      isValid: false,
      isRequired: true,
      description: 'Your Supabase anonymous/public API key. This key is safe to use in client-side code.',
      placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      validationPattern: /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
      validationMessage: 'Must be a valid JWT token starting with "eyJ"'
    }
  ]);

  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGeneratingEnv, setIsGeneratingEnv] = useState(false);
  const [envFileContent, setEnvFileContent] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Validate environment variables
  useEffect(() => {
    const updatedVars = envVariables.map(envVar => {
      if (!envVar.value.trim()) {
        return { ...envVar, isValid: false };
      }
      
      if (envVar.validationPattern) {
        return { ...envVar, isValid: envVar.validationPattern.test(envVar.value.trim()) };
      }
      
      return { ...envVar, isValid: true };
    });
    
    setEnvVariables(updatedVars);
  }, []);

  // Generate .env file content
  useEffect(() => {
    const content = envVariables
      .map(envVar => `${envVar.key}=${envVar.value}`)
      .join('\n');
    setEnvFileContent(content);
  }, [envVariables]);

  const handleInputChange = (key: string, value: string) => {
    setEnvVariables(prev => prev.map(envVar => {
      if (envVar.key === key) {
        const trimmedValue = value.trim();
        let isValid = false;
        
        if (trimmedValue) {
          if (envVar.validationPattern) {
            isValid = envVar.validationPattern.test(trimmedValue);
          } else {
            isValid = true;
          }
        }
        
        return { ...envVar, value, isValid };
      }
      return envVar;
    }));
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = async (text: string, key?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (key) {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadEnvFile = () => {
    setIsGeneratingEnv(true);
    
    setTimeout(() => {
      const blob = new Blob([envFileContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '.env';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsGeneratingEnv(false);
    }, 1000);
  };

  const allRequiredFieldsValid = envVariables
    .filter(envVar => envVar.isRequired)
    .every(envVar => envVar.isValid);

  const getStepStatus = (step: number) => {
    switch (step) {
      case 1:
        return 'current';
      case 2:
        return envVariables.some(v => v.value) ? 'current' : 'pending';
      case 3:
        return allRequiredFieldsValid ? 'current' : 'pending';
      case 4:
        return allRequiredFieldsValid ? 'current' : 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Glass Morphism Header Background */}
      <div className="header-background"></div>

      {/* Fixed Logo */}
      <div className="logo">
        <Link to="/" className="flex items-center">
          <img
            src="/Invelar Logo.png"
            alt="Invelar Logo"
            className="h-16 w-auto"
          />
        </Link>
      </div>

      {/* Fixed Navigation Button */}
      <div className="nav-buttons">
        <Link to="/">
          <Button 
            variant="outline" 
            className="border-gray-600 text-black hover:bg-gray-800 hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <main className="py-20 px-4 pt-32">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="bg-[#2a2a2a] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Database className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Supabase Setup Guide</h1>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Follow this step-by-step guide to configure your Supabase environment variables and get your application connected to your database.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {[
                { number: 1, title: 'Learn About Supabase', icon: Database },
                { number: 2, title: 'Find Your Credentials', icon: Key },
                { number: 3, title: 'Configure Variables', icon: Globe },
                { number: 4, title: 'Download & Install', icon: FileText }
              ].map((step, index) => {
                const status = getStepStatus(step.number);
                return (
                  <div key={step.number} className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                      status === 'current' ? "bg-white text-black" : "bg-[#2a2a2a] text-gray-400"
                    )}>
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className={cn(
                      "text-sm font-medium text-center",
                      status === 'current' ? "text-white" : "text-gray-400"
                    )}>
                      {step.title}
                    </span>
                    {index < 3 && (
                      <div className={cn(
                        "hidden md:block w-24 h-0.5 mt-6 absolute",
                        status === 'current' ? "bg-white" : "bg-gray-600"
                      )} style={{ left: `${(index + 1) * 25}%` }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Information */}
            <div className="space-y-6">
              {/* What is Supabase */}
              <Card className="bg-[#2a2a2a] border-gray-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <Database className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">What is Supabase?</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    Supabase is an open-source Firebase alternative that provides a complete backend-as-a-service platform. 
                    It includes a PostgreSQL database, authentication, real-time subscriptions, and auto-generated APIs.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Key Features:</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• PostgreSQL database with real-time capabilities</li>
                      <li>• Auto-generated REST and GraphQL APIs</li>
                      <li>• Built-in authentication and authorization</li>
                      <li>• Row Level Security (RLS) for data protection</li>
                      <li>• Dashboard for database management</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Why Environment Variables */}
              <Card className="bg-[#2a2a2a] border-gray-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <Key className="h-6 w-6 text-green-400" />
                    <h2 className="text-xl font-bold text-white">Why Environment Variables?</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    Environment variables keep your sensitive configuration data separate from your code. 
                    This is a security best practice that prevents accidental exposure of credentials.
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Benefits:</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Keep sensitive data out of version control</li>
                      <li>• Different configurations for different environments</li>
                      <li>• Easy to update without changing code</li>
                      <li>• Industry standard security practice</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Finding Credentials */}
              <Card className="bg-[#2a2a2a] border-gray-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <ExternalLink className="h-6 w-6 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">Finding Your Credentials</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600">
                      <h4 className="font-semibold text-white mb-2">Step 1: Access Your Dashboard</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        Go to your Supabase project dashboard at{' '}
                        <a 
                          href="https://supabase.com/dashboard" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          supabase.com/dashboard
                        </a>
                      </p>
                    </div>
                    
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600">
                      <h4 className="font-semibold text-white mb-2">Step 2: Navigate to Settings</h4>
                      <p className="text-gray-300 text-sm">
                        Click on "Settings" in the left sidebar, then select "API" to find your project credentials.
                      </p>
                    </div>
                    
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600">
                      <h4 className="font-semibold text-white mb-2">Step 3: Copy Your Credentials</h4>
                      <p className="text-gray-300 text-sm">
                        Copy your "Project URL" and "anon/public" API key from the API settings page.
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Supabase Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Configuration */}
            <div className="space-y-6">
              {/* Environment Variables Form */}
              <Card className="bg-[#2a2a2a] border-gray-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-6 w-6 text-yellow-400" />
                    <h2 className="text-xl font-bold text-white">Configure Environment Variables</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {envVariables.map((envVar) => (
                    <div key={envVar.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-white font-medium">
                          {envVar.key}
                          {envVar.isRequired && <span className="text-red-400 ml-1">*</span>}
                        </Label>
                        <div className="flex items-center space-x-2">
                          {envVar.value && (
                            <button
                              onClick={() => copyToClipboard(envVar.value, envVar.key)}
                              className="text-gray-400 hover:text-white transition-colors duration-200"
                              title="Copy value"
                            >
                              {copiedKey === envVar.key ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          )}
                          {envVar.key.includes('KEY') && (
                            <button
                              onClick={() => toggleShowKey(envVar.key)}
                              className="text-gray-400 hover:text-white transition-colors duration-200"
                              title={showKeys[envVar.key] ? "Hide key" : "Show key"}
                            >
                              {showKeys[envVar.key] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Input
                          type={envVar.key.includes('KEY') && !showKeys[envVar.key] ? 'password' : 'text'}
                          value={envVar.value}
                          onChange={(e) => handleInputChange(envVar.key, e.target.value)}
                          placeholder={envVar.placeholder}
                          className={cn(
                            "bg-[#1a1a1a] border-gray-600 text-white placeholder-gray-400 transition-all duration-300",
                            envVar.value && envVar.isValid 
                              ? "border-green-500 focus:border-green-400" 
                              : envVar.value && !envVar.isValid 
                              ? "border-red-500 focus:border-red-400"
                              : "focus:border-gray-400"
                          )}
                        />
                        {envVar.value && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {envVar.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400">
                        {envVar.description}
                      </p>
                      
                      {envVar.value && !envVar.isValid && envVar.validationMessage && (
                        <p className="text-sm text-red-400 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {envVar.validationMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Generated .env File */}
              <Card className="bg-[#2a2a2a] border-gray-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-orange-400" />
                      <h2 className="text-xl font-bold text-white">Generated .env File</h2>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(envFileContent, 'env-file')}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-black hover:bg-gray-800 hover:text-white"
                    >
                      {copiedKey === 'env-file' ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={envFileContent}
                    readOnly
                    className="bg-[#1a1a1a] border-gray-600 text-white font-mono text-sm min-h-[120px] resize-none"
                    placeholder="Your environment variables will appear here..."
                  />
                  
                  <div className="space-y-3">
                    <Button
                      onClick={downloadEnvFile}
                      disabled={!allRequiredFieldsValid || isGeneratingEnv}
                      className="w-full bg-white text-black hover:bg-gray-100 font-semibold transition-all duration-300"
                    >
                      {isGeneratingEnv ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Download .env File
                        </>
                      )}
                    </Button>
                    
                    {!allRequiredFieldsValid && (
                      <p className="text-sm text-yellow-400 text-center">
                        Please fill in all required fields to download the .env file
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Installation Instructions */}
              <Card className="bg-[#2a2a2a] border-gray-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">Installation Instructions</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600">
                      <h4 className="font-semibold text-white mb-2">1. Save the .env File</h4>
                      <p className="text-gray-300 text-sm">
                        Place the downloaded .env file in the root directory of your project (same level as package.json).
                      </p>
                    </div>
                    
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600">
                      <h4 className="font-semibold text-white mb-2">2. Restart Your Development Server</h4>
                      <p className="text-gray-300 text-sm mb-2">
                        Stop your current development server and restart it to load the new environment variables:
                      </p>
                      <code className="bg-black text-green-400 px-2 py-1 rounded text-xs">
                        npm run dev
                      </code>
                    </div>
                    
                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600">
                      <h4 className="font-semibold text-white mb-2">3. Verify Connection</h4>
                      <p className="text-gray-300 text-sm">
                        Visit your contact form to test the Supabase connection. You should no longer see configuration warnings.
                      </p>
                    </div>
                  </div>
                  
                  {allRequiredFieldsValid && (
                    <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <h4 className="font-semibold text-green-400">Ready to Go!</h4>
                      </div>
                      <p className="text-green-300 text-sm mt-2">
                        Your environment variables are properly configured. Download the .env file and restart your server.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Troubleshooting Section */}
          <Card className="bg-[#2a2a2a] border-gray-700 mt-8">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <h2 className="text-xl font-bold text-white">Common Issues & Troubleshooting</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600">
                    <h4 className="font-semibold text-white mb-2">Environment Variables Not Loading</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Ensure .env file is in the project root directory</li>
                      <li>• Restart your development server completely</li>
                      <li>• Check that variable names start with VITE_</li>
                      <li>• Verify no extra spaces around the = sign</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600">
                    <h4 className="font-semibold text-white mb-2">Invalid Supabase URL</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• URL should start with https://</li>
                      <li>• URL should end with .supabase.co</li>
                      <li>• Copy exactly from your Supabase dashboard</li>
                      <li>• Don't include trailing slashes</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600">
                    <h4 className="font-semibold text-white mb-2">Invalid API Key</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Use the "anon/public" key, not the service role key</li>
                      <li>• Key should start with "eyJ"</li>
                      <li>• Copy the entire key without truncation</li>
                      <li>• Regenerate key if it's been compromised</li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-600">
                    <h4 className="font-semibold text-white mb-2">Connection Still Failing</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Check your Supabase project is active</li>
                      <li>• Verify your project hasn't been paused</li>
                      <li>• Ensure RLS policies are properly configured</li>
                      <li>• Check browser console for detailed errors</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold mb-6">Ready to Test Your Setup?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button className="bg-white text-black hover:bg-gray-100 font-semibold transition-all duration-300 transform hover:scale-105">
                  Test Contact Form
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </Link>
              <Button 
                variant="outline"
                onClick={() => window.open('https://supabase.com/docs', '_blank')}
                className="border-gray-600 text-black hover:bg-gray-800 hover:text-white transition-all duration-300"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Supabase Documentation
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}