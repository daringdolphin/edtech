/*
<ai_context>
Client component for academic profile settings.
Handles subject/level selection, topic drilldown, and profile updates.
</ai_context>
*/

"use client"

import { useState, useTransition } from "react"
import { AcademicProfile, FrameworkSummary, TopicTree } from "@/types"
import {
  updateAcademicProfileAction,
  resetAcademicProfileAction,
  getTopicsForSubjectLevelAction
} from "@/actions/db/academic-profile-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/lib/hooks/use-toast"
import { Loader2, ExternalLink, Search } from "lucide-react"

interface Props {
  profile: AcademicProfile
  taxonomy: FrameworkSummary
}

export function AcademicProfileSettings({ profile, taxonomy }: Props) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Selected IDs
  const [selectedSubjectLevelIds, setSelectedSubjectLevelIds] = useState<string[]>(
    profile.subjectLevels.map(sl => sl.id)
  )
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(
    profile.topics.map(t => t.id)
  )
  const [selectedSubtopicIds, setSelectedSubtopicIds] = useState<string[]>(
    profile.subtopics.map(st => st.id)
  )

  // Defaults
  const [preferredSubjectLevelId, setPreferredSubjectLevelId] = useState<string | null>(
    profile.profile.preferredSubjectLevelId
  )
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(
    profile.profile.currentTopicId
  )

  // Topic trees (lazy-loaded)
  const [topicTrees, setTopicTrees] = useState<Record<string, TopicTree>>({})
  const [loadingTopics, setLoadingTopics] = useState<Set<string>>(new Set())

  // Search filter
  const [topicSearchQuery, setTopicSearchQuery] = useState("")

  // Toggle subject-level selection
  const toggleSubjectLevel = (subjectLevelId: string) => {
    setSelectedSubjectLevelIds(prev => {
      const isSelected = prev.includes(subjectLevelId)
      if (isSelected) {
        // Deselecting - clear topics/subtopics for this subject-level
        const topicsToRemove = profile.topics
          .filter(t => t.subjectLevelId === subjectLevelId)
          .map(t => t.id)
        setSelectedTopicIds(prev => prev.filter(id => !topicsToRemove.includes(id)))

        // If this was the preferred subject-level, clear it
        if (preferredSubjectLevelId === subjectLevelId) {
          setPreferredSubjectLevelId(null)
        }

        return prev.filter(id => id !== subjectLevelId)
      } else {
        return [...prev, subjectLevelId]
      }
    })
  }

  // Load topics for a subject-level
  const loadTopicsForSubjectLevel = async (subjectLevelId: string) => {
    if (topicTrees[subjectLevelId] || loadingTopics.has(subjectLevelId)) {
      return
    }

    setLoadingTopics(prev => new Set(prev).add(subjectLevelId))

    const result = await getTopicsForSubjectLevelAction(subjectLevelId)

    setLoadingTopics(prev => {
      const next = new Set(prev)
      next.delete(subjectLevelId)
      return next
    })

    if (result.isSuccess) {
      setTopicTrees(prev => ({
        ...prev,
        [subjectLevelId]: result.data
      }))
    } else {
      toast({
        title: "Error loading topics",
        description: result.message,
        variant: "destructive"
      })
    }
  }

  // Toggle topic selection
  const toggleTopic = (topicId: string) => {
    setSelectedTopicIds(prev => {
      const isSelected = prev.includes(topicId)
      if (isSelected) {
        // Deselecting - clear subtopics for this topic
        const subtopicsToRemove = profile.subtopics
          .filter(st => st.topicId === topicId)
          .map(st => st.id)
        setSelectedSubtopicIds(prev => prev.filter(id => !subtopicsToRemove.includes(id)))

        // If this was the current topic, clear it
        if (currentTopicId === topicId) {
          setCurrentTopicId(null)
        }

        return prev.filter(id => id !== topicId)
      } else {
        return [...prev, topicId]
      }
    })
  }

  // Toggle subtopic selection
  const toggleSubtopic = (subtopicId: string) => {
    setSelectedSubtopicIds(prev => {
      const isSelected = prev.includes(subtopicId)
      return isSelected ? prev.filter(id => id !== subtopicId) : [...prev, subtopicId]
    })
  }

  // Save profile
  const handleSave = () => {
    startTransition(async () => {
      const result = await updateAcademicProfileAction({
        frameworkId: profile.framework.id,
        subjectLevelIds: selectedSubjectLevelIds,
        topicIds: selectedTopicIds,
        subtopicIds: selectedSubtopicIds,
        preferredSubjectLevelId,
        currentTopicId
      })

      if (result.isSuccess) {
        toast({
          title: "Profile saved",
          description: "Your academic profile has been updated successfully"
        })
      } else {
        toast({
          title: "Error saving profile",
          description: result.message,
          variant: "destructive"
        })
      }
    })
  }

  // Reset profile
  const handleReset = () => {
    startTransition(async () => {
      const result = await resetAcademicProfileAction()

      if (result.isSuccess) {
        setSelectedSubjectLevelIds([])
        setSelectedTopicIds([])
        setSelectedSubtopicIds([])
        setPreferredSubjectLevelId(null)
        setCurrentTopicId(null)
        setTopicTrees({})

        toast({
          title: "Profile reset",
          description: "Your academic profile has been cleared"
        })
      } else {
        toast({
          title: "Error resetting profile",
          description: result.message,
          variant: "destructive"
        })
      }
    })
  }

  // Get selected subject-levels for dropdown
  const selectedSubjectLevelsForDropdown = taxonomy.subjects.flatMap(subject =>
    subject.levels
      .filter(level => selectedSubjectLevelIds.includes(level.id))
      .map(level => ({
        id: level.id,
        label: `${subject.displayName} - ${level.displayName}${level.stream ? ` (${level.stream})` : ""}`
      }))
  )

  return (
    <div className="space-y-6">
      {/* Framework Card */}
      <Card>
        <CardHeader>
          <CardTitle>Curriculum Framework</CardTitle>
          <CardDescription>
            {profile.framework.name} ({profile.framework.version})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {profile.framework.description}
          </p>
          <a
            href="https://www.moe.gov.sg/primary/curriculum"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center text-sm text-primary hover:underline"
          >
            View official syllabus
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </CardContent>
      </Card>

      {/* Subject & Level Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Subjects & Levels</CardTitle>
          <CardDescription>
            Select all subject-level combinations you teach or study
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {taxonomy.subjects.map(subject => (
            <div key={subject.id} className="border-b pb-4 last:border-0">
              <h3 className="mb-2 font-semibold">{subject.displayName}</h3>
              {subject.description && (
                <p className="mb-3 text-sm text-muted-foreground">
                  {subject.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {subject.levels.map(level => (
                  <Badge
                    key={level.id}
                    variant={
                      selectedSubjectLevelIds.includes(level.id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleSubjectLevel(level.id)}
                  >
                    {level.displayName}
                    {level.stream && ` (${level.stream})`}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Topics & Subtopics */}
      {selectedSubjectLevelIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topics & Subtopics</CardTitle>
            <CardDescription>
              Select specific topics you're currently focusing on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics by name or code..."
                  value={topicSearchQuery}
                  onChange={e => setTopicSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Accordion type="multiple" className="w-full">
              {selectedSubjectLevelsForDropdown.map(sl => {
                const isLoading = loadingTopics.has(sl.id)
                const tree = topicTrees[sl.id]

                return (
                  <AccordionItem key={sl.id} value={sl.id}>
                    <AccordionTrigger
                      onClick={() => loadTopicsForSubjectLevel(sl.id)}
                    >
                      {sl.label}
                    </AccordionTrigger>
                    <AccordionContent>
                      {isLoading && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      )}

                      {tree && (
                        <div className="space-y-3 pl-4">
                          {tree.topics
                            .filter(
                              topic =>
                                !topicSearchQuery ||
                                topic.name
                                  .toLowerCase()
                                  .includes(topicSearchQuery.toLowerCase()) ||
                                topic.code
                                  .toLowerCase()
                                  .includes(topicSearchQuery.toLowerCase())
                            )
                            .map(topic => (
                              <div key={topic.id} className="space-y-2">
                                <div className="flex items-start space-x-2">
                                  <Checkbox
                                    id={`topic-${topic.id}`}
                                    checked={selectedTopicIds.includes(topic.id)}
                                    onCheckedChange={() => toggleTopic(topic.id)}
                                  />
                                  <Label
                                    htmlFor={`topic-${topic.id}`}
                                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {topic.code}: {topic.name}
                                    {topic.strand && (
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        ({topic.strand})
                                      </span>
                                    )}
                                  </Label>
                                </div>

                                {/* Subtopics */}
                                {topic.subtopics.length > 0 &&
                                  selectedTopicIds.includes(topic.id) && (
                                    <div className="ml-6 space-y-2 border-l-2 pl-4">
                                      {topic.subtopics.map(subtopic => (
                                        <div
                                          key={subtopic.id}
                                          className="flex items-start space-x-2"
                                        >
                                          <Checkbox
                                            id={`subtopic-${subtopic.id}`}
                                            checked={selectedSubtopicIds.includes(
                                              subtopic.id
                                            )}
                                            onCheckedChange={() =>
                                              toggleSubtopic(subtopic.id)
                                            }
                                          />
                                          <Label
                                            htmlFor={`subtopic-${subtopic.id}`}
                                            className="cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            {subtopic.code}: {subtopic.name}
                                          </Label>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Default Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Default Preferences</CardTitle>
          <CardDescription>
            Set your preferred defaults for creating new papers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preferred-subject-level">
              Preferred Subject & Level
            </Label>
            <Select
              value={preferredSubjectLevelId || "none"}
              onValueChange={value =>
                setPreferredSubjectLevelId(value === "none" ? null : value)
              }
              disabled={selectedSubjectLevelIds.length === 0}
            >
              <SelectTrigger id="preferred-subject-level">
                <SelectValue placeholder="Select preferred subject-level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {selectedSubjectLevelsForDropdown.map(sl => (
                  <SelectItem key={sl.id} value={sl.id}>
                    {sl.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be pre-filled when creating new papers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-topic">Current Focus Topic</Label>
            <Select
              value={currentTopicId || "none"}
              onValueChange={value =>
                setCurrentTopicId(value === "none" ? null : value)
              }
              disabled={selectedTopicIds.length === 0}
            >
              <SelectTrigger id="current-topic">
                <SelectValue placeholder="Select current topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {Object.values(topicTrees)
                  .flatMap(tree => tree.topics)
                  .filter(topic => selectedTopicIds.includes(topic.id))
                  .map(topic => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.code}: {topic.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Highlights this topic in your question library and dashboards
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={isPending}>
              Reset Profile
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Academic Profile?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all your subject, level, and topic selections.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>
                Reset Profile
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </div>

      {/* Info about selection counts */}
      {(selectedSubjectLevelIds.length > 10 ||
        selectedTopicIds.length > 20) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You've selected{" "}
              {selectedSubjectLevelIds.length} subject-level combinations and{" "}
              {selectedTopicIds.length} topics. While there's no hard limit,
              selecting fewer items may help you stay focused.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
