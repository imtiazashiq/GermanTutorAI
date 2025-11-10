import { useState } from 'react';
import { GraduationCap, Clock, Target, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCourse, CourseResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

/**
 * CourseWizard - Multi-step wizard for creating personalized German courses
 */
interface CourseWizardProps {
  onCourseCreated: (course: CourseResponse) => void;
}

export const CourseWizard = ({ onCourseCreated }: CourseWizardProps) => {
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('A1');
  const [dailyHours, setDailyHours] = useState('1');
  const [goals, setGoals] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateCourse = async () => {
    setIsLoading(true);
    try {
      const course = await createCourse({
        level,
        dailyStudyHours: parseFloat(dailyHours),
        goals: goals.trim() || undefined,
      });

      onCourseCreated(course);
      toast({
        title: 'Course Created!',
        description: 'Your personalized German course is ready.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create course',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="bg-card rounded-xl shadow-card p-6 border border-border max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Create Your Course</h2>
          <p className="text-muted-foreground">Step {step} of 3</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-8">
        <div
          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Step 1: Level Selection */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">What's your German level?</h3>
          </div>
          <Select value={level} onValueChange={(val) => setLevel(val as typeof level)}>
            <SelectTrigger className="w-full bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              <SelectItem value="A1">A1 - Beginner</SelectItem>
              <SelectItem value="A2">A2 - Elementary</SelectItem>
              <SelectItem value="B1">B1 - Intermediate</SelectItem>
              <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
              <SelectItem value="C1">C1 - Advanced</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">
            Not sure? A1 is for complete beginners, C1 is near-native proficiency.
          </p>
        </div>
      )}

      {/* Step 2: Study Time */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">How much time can you dedicate?</h3>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Hours per day</label>
            <Input
              type="number"
              min="0.5"
              max="8"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(e.target.value)}
              className="bg-muted"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            We recommend 1-2 hours per day for steady progress.
          </p>
        </div>
      )}

      {/* Step 3: Goals */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">What are your learning goals?</h3>
          </div>
          <Textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="E.g., I want to pass the B2 exam, speak fluently with colleagues, travel to Germany..."
            className="bg-muted min-h-[120px]"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Optional - helps us tailor the course to your needs.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button
          onClick={prevStep}
          variant="outline"
          disabled={step === 1 || isLoading}
        >
          Back
        </Button>
        {step < 3 ? (
          <Button
            onClick={nextStep}
            className="bg-gradient-primary hover:opacity-90"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleCreateCourse}
            disabled={isLoading}
            className="bg-gradient-secondary hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Course'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
