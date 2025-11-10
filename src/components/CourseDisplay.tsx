import { useState, useEffect } from 'react';
import { BookOpen, Languages, ListChecks, ArrowLeft, Play, CheckCircle2, Circle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseResponse } from '@/lib/api';
import { generateExercises, updateProgress, getProgress, ProgressData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

/**
 * CourseDisplay - Shows the generated course with lessons, vocabulary, and exercises
 * Now includes retro-style scroller and progress tracking
 */
interface CourseDisplayProps {
  course: CourseResponse;
  onBack: () => void;
}

export const CourseDisplay = ({ course, onBack }: CourseDisplayProps) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [generatedExercises, setGeneratedExercises] = useState<Record<number, string[]>>({});
  const [loadingExercises, setLoadingExercises] = useState<Record<number, boolean>>({});
  const [progress, setProgress] = useState<ProgressData>({ progress: 0, lessons: {} });
  const [started, setStarted] = useState(false);
  const { toast } = useToast();

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progressData = await getProgress();
      setProgress(progressData);
      // Find first incomplete lesson
      const incompleteIndex = course.lessons.findIndex((_, idx) => !progressData.lessons[idx]?.completed);
      if (incompleteIndex >= 0) {
        setCurrentLessonIndex(incompleteIndex);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const handleStartCourse = () => {
    setStarted(true);
    toast({
      title: 'Course Started!',
      description: 'Begin your German learning journey!',
    });
  };

  const handleGenerateExercises = async (lessonIndex: number) => {
    if (generatedExercises[lessonIndex] || loadingExercises[lessonIndex]) return;

    setLoadingExercises(prev => ({ ...prev, [lessonIndex]: true }));
    
    try {
      const lesson = course.lessons[lessonIndex];
      const exerciseData = await generateExercises({
        lessonIndex,
        lessonTitle: lesson.title,
        lessonContent: lesson.content,
        vocabulary: lesson.vocabulary,
        grammar: lesson.grammar,
        level: course.level,
      });

      setGeneratedExercises(prev => ({
        ...prev,
        [lessonIndex]: exerciseData.exercises,
      }));

      toast({
        title: 'Exercises Generated!',
        description: `Generated ${exerciseData.exercises.length} exercises for this lesson.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate exercises',
        variant: 'destructive',
      });
    } finally {
      setLoadingExercises(prev => ({ ...prev, [lessonIndex]: false }));
    }
  };

  const handleCompleteLesson = async (lessonIndex: number) => {
    try {
      const response = await updateProgress({
        lessonIndex,
        completed: true,
      });

      setProgress(prev => ({
        ...prev,
        progress: response.progress,
        lessons: {
          ...prev.lessons,
          [lessonIndex]: { completed: true },
        },
      }));

      toast({
        title: 'Lesson Completed! 🎉',
        description: `Great job completing lesson ${lessonIndex + 1}!`,
      });

      // Move to next incomplete lesson
      const nextIncomplete = course.lessons.findIndex(
        (_, idx) => idx > lessonIndex && !progress.lessons[idx]?.completed
      );
      if (nextIncomplete >= 0) {
        setCurrentLessonIndex(nextIncomplete);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      });
    }
  };

  const isLessonCompleted = (index: number) => progress.lessons[index]?.completed || false;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-card rounded-xl shadow-card p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Wizard
          </Button>
          {!started && (
            <Button
              onClick={handleStartCourse}
              className="bg-gradient-primary hover:opacity-90 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Course
            </Button>
          )}
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-gradient-primary p-3 rounded-lg">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{course.courseName}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Languages className="w-4 h-4" />
                Level: {course.level}
              </span>
              <span>•</span>
              <span>Duration: {course.estimatedDuration}</span>
              <span>•</span>
              <span>{course.lessons.length} Lessons</span>
            </div>
            {started && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progress.progress * 100)}% Complete
                  </span>
                </div>
                <Progress value={progress.progress * 100} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Retro Style Scroller - Lesson Navigation */}
      {started && (
        <div className="bg-card rounded-xl shadow-card p-4 border border-border overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {course.lessons.map((lesson, index) => (
              <button
                key={index}
                onClick={() => setCurrentLessonIndex(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all whitespace-nowrap ${
                  currentLessonIndex === index
                    ? 'border-primary bg-primary/10 text-primary'
                    : isLessonCompleted(index)
                    ? 'border-green-500/50 bg-green-500/10 text-green-600'
                    : 'border-border bg-muted hover:border-primary/50'
                }`}
              >
                {isLessonCompleted(index) ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
                <span className="font-medium">Lesson {index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Lesson - Retro Scroller Style */}
      <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
        {/* Retro Terminal Header */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 font-mono text-sm text-foreground">
                lesson_{currentLessonIndex + 1}.txt
              </span>
            </div>
            {isLessonCompleted(currentLessonIndex) && (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Retro Scroller Content */}
        <div className="p-6 max-h-[calc(100vh-400px)] overflow-y-auto custom-scrollbar">
          {course.lessons.map((lesson, index) => (
            <div
              key={index}
              className={index === currentLessonIndex ? 'block' : 'hidden'}
            >
              {/* Lesson Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary text-primary-foreground font-bold text-lg">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{lesson.title}</h3>
                  <p className="text-sm text-muted-foreground">Lesson {index + 1} of {course.lessons.length}</p>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="space-y-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed text-base whitespace-pre-wrap">{lesson.content}</p>
                </div>

                {/* Vocabulary Section */}
                {lesson.vocabulary.length > 0 && (
                  <Card className="p-4 bg-muted/50 border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Languages className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-foreground text-lg">Vocabulary</h4>
                    </div>
                    <ul className="space-y-2">
                      {lesson.vocabulary.map((word, i) => (
                        <li key={i} className="text-foreground flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>{word}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Grammar Section */}
                {lesson.grammar.length > 0 && (
                  <Card className="p-4 bg-muted/50 border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-5 h-5 text-secondary" />
                      <h4 className="font-semibold text-foreground text-lg">Grammar</h4>
                    </div>
                    <ul className="space-y-2">
                      {lesson.grammar.map((rule, i) => (
                        <li key={i} className="text-foreground flex items-start gap-2">
                          <span className="text-secondary font-bold">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Generated Exercises Section */}
                <Card className="p-4 bg-gradient-primary/10 border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-foreground text-lg">Practice Exercises</h4>
                    </div>
                    {!generatedExercises[index] && !loadingExercises[index] && (
                      <Button
                        onClick={() => handleGenerateExercises(index)}
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        Generate Exercises
                      </Button>
                    )}
                  </div>

                  {loadingExercises[index] && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Generating exercises...</span>
                    </div>
                  )}

                  {generatedExercises[index] && (
                    <ul className="space-y-3">
                      {generatedExercises[index].map((exercise, i) => (
                        <li key={i} className="text-foreground flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
                          <span className="text-primary font-bold text-lg">{i + 1}.</span>
                          <span className="flex-1">{exercise}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {!generatedExercises[index] && !loadingExercises[index] && (
                    <p className="text-muted-foreground text-sm">
                      Click "Generate Exercises" to create personalized practice exercises for this lesson.
                    </p>
                  )}
                </Card>

                {/* Complete Lesson Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => handleCompleteLesson(index)}
                    disabled={isLessonCompleted(index)}
                    className={`${
                      isLessonCompleted(index)
                        ? 'bg-green-600 hover:bg-green-600'
                        : 'bg-gradient-primary hover:opacity-90'
                    }`}
                  >
                    {isLessonCompleted(index) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {started && (
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
            disabled={currentLessonIndex === 0}
            variant="outline"
          >
            Previous Lesson
          </Button>
          <span className="text-sm text-muted-foreground">
            Lesson {currentLessonIndex + 1} of {course.lessons.length}
          </span>
          <Button
            onClick={() => setCurrentLessonIndex(Math.min(course.lessons.length - 1, currentLessonIndex + 1))}
            disabled={currentLessonIndex === course.lessons.length - 1}
            variant="outline"
          >
            Next Lesson
          </Button>
        </div>
      )}
    </div>
  );
};
