import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, GraduationCap } from 'lucide-react';
import { Chat } from '@/components/Chat';
import { CourseWizard } from '@/components/CourseWizard';
import { CourseDisplay } from '@/components/CourseDisplay';
import { CourseResponse } from '@/lib/api';

/**
 * Main application page with tabbed interface
 */
const Index = () => {
  const [currentCourse, setCurrentCourse] = useState<CourseResponse | null>(null);

  const handleCourseCreated = (course: CourseResponse) => {
    setCurrentCourse(course);
  };

  const handleBackToWizard = () => {
    setCurrentCourse(null);
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-lg border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">German Learning Assistant</h1>
              <p className="text-sm text-muted-foreground">Master German with AI-powered guidance</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-muted">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="course" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Course
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-0">
            <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] min-h-[600px]">
              <Chat />
            </div>
          </TabsContent>

          {/* Course Tab */}
          <TabsContent value="course" className="mt-0">
            {currentCourse ? (
              <CourseDisplay course={currentCourse} onBack={handleBackToWizard} />
            ) : (
              <CourseWizard onCourseCreated={handleCourseCreated} />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-card/30 backdrop-blur-lg border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Practice makes perfect. Keep learning! 🚀
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
