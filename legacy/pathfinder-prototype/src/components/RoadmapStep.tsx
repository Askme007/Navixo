import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, BookOpen, CheckCircle2, PlayCircle, Circle, Clock, RotateCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface RoadmapStepProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'not-started' | 'in-progress' | 'done';
  isSelected: boolean;
  isVisible: boolean;
  index: number;
  onClick: () => void;
  onStatusChange?: (id: string, newStatus: 'not-started' | 'in-progress' | 'done') => void;
}

type StepVariant = 'collapsed' | 'expanded' | 'expanded-with-resources';

export function RoadmapStep({
  id,
  title,
  description,
  duration,
  level,
  status: initialStatus,
  isSelected,
  isVisible,
  index,
  onClick,
  onStatusChange,
}: RoadmapStepProps) {
  const [variant, setVariant] = useState<StepVariant>('collapsed');
  const [status, setStatus] = useState<'not-started' | 'in-progress' | 'done'>(initialStatus);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'from-blue-400 to-blue-600';
      case 'intermediate':
        return 'from-amber-400 to-amber-600';
      case 'advanced':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'intermediate':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-5 h-5 text-white" />;
      case 'in-progress':
        return <RotateCw className="w-5 h-5 text-white" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleStatusChange = (newStatus: 'not-started' | 'in-progress' | 'done') => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(id, newStatus);
    }
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVariant(variant === 'collapsed' ? 'expanded' : 'collapsed');
  };

  const handleViewResources = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (variant === 'expanded') {
      setVariant('expanded-with-resources');
    } else {
      onClick();
    }
  };

  const isExpanded = variant === 'expanded' || variant === 'expanded-with-resources';
  const showResourcesPlaceholder = variant === 'expanded-with-resources';

  // Get background and border styling based on status
  const getStatusStyling = () => {
    switch (status) {
      case 'in-progress':
        return {
          background: '#1F2A3A',
          border: 'border-[#333333]',
          leftAccent: 'border-l-4 border-l-blue-500',
        };
      case 'done':
        return {
          background: '#1F3328',
          border: 'border-[#333333]',
          leftAccent: 'border-l-4 border-l-emerald-500',
        };
      default:
        return {
          background: '#222222',
          border: 'border-[#333333]',
          leftAccent: '',
        };
    }
  };

  const statusStyling = getStatusStyling();

  return (
    <div
      className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Node Card */}
      <Card
        className={`cursor-pointer transition-all border ${statusStyling.leftAccent} ${
          isSelected
            ? 'border-cyan-500 shadow-lg'
            : `${statusStyling.border} hover:border-[#444444]`
        }`}
        style={{ backgroundColor: isSelected ? '#2B2B2B' : statusStyling.background }}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getLevelColor(level)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                {getStatusIcon(status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={`${getLevelBadgeColor(level)} border text-xs`}>
                    {level}
                  </Badge>
                  {status === 'done' && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
                      Completed
                    </Badge>
                  )}
                  {status === 'in-progress' && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                      In Progress
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-[#ffffff]" style={{ fontWeight: 600 }}>{title}</CardTitle>
                
                {/* Status Selector - Mobile: Below title, Desktop: Top right */}
                <div className="md:hidden mt-3 mb-2">
                  <Select value={status} onValueChange={(value) => handleStatusChange(value as 'not-started' | 'in-progress' | 'done')}>
                    <SelectTrigger 
                      className="w-[120px] bg-[#2B2B2B] border-[#3D3D3D] text-white hover:bg-[#333333] h-7 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2B2B2B] border-[#3D3D3D]">
                      <SelectItem value="not-started" className="text-gray-400 focus:bg-[#333333] focus:text-gray-300 text-xs">
                        <div className="flex items-center gap-2">
                          <Circle className="w-3 h-3" />
                          <span>Not Started</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="in-progress" className="text-blue-400 focus:bg-[#333333] focus:text-blue-300 text-xs">
                        <div className="flex items-center gap-2">
                          <RotateCw className="w-3 h-3" />
                          <span>In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="done" className="text-emerald-400 focus:bg-[#333333] focus:text-emerald-300 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <CardDescription className="text-[#b4b4b4] mt-1" style={{ fontWeight: 500 }}>
                  {description}
                </CardDescription>
                <div className="flex items-center gap-3 mt-2 text-sm text-[#b4b4b4]" style={{ fontWeight: 500 }}>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{duration}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto md:ml-0">
              {/* Status Selector - Desktop Only */}
              <div className="hidden md:block">
                <Select value={status} onValueChange={(value) => handleStatusChange(value as 'not-started' | 'in-progress' | 'done')}>
                  <SelectTrigger 
                    className="w-[140px] bg-[#2B2B2B] border-[#3D3D3D] text-white hover:bg-[#333333] h-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2B2B2B] border-[#3D3D3D]">
                    <SelectItem value="not-started" className="text-gray-400 focus:bg-[#333333] focus:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Circle className="w-4 h-4" />
                        <span>Not Started</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="in-progress" className="text-blue-400 focus:bg-[#333333] focus:text-blue-300">
                      <div className="flex items-center gap-2">
                        <RotateCw className="w-4 h-4" />
                        <span>In Progress</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="done" className="text-emerald-400 focus:bg-[#333333] focus:text-emerald-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/5"
                onClick={handleExpandToggle}
              >
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="border-t border-[#333333] pt-4">
            <div className="space-y-3">
              <h4 className="text-[#ffffff] text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Quick Overview
              </h4>
              <p className="text-sm text-[#b4b4b4]" style={{ fontWeight: 500 }}>
                This milestone will take approximately {duration} to complete. Click on this node to see detailed resources and mentor tips in the right panel.
              </p>
              <Button
                size="sm"
                className="w-full bg-white text-black hover:bg-[#f5f5f5]"
                style={{ fontWeight: 600 }}
                onClick={handleViewResources}
              >
                View Resources →
              </Button>

              {/* Resources Placeholder Container */}
              {showResourcesPlaceholder && (
                <div className="mt-3 bg-[#232323] border border-[#2E2E2E] rounded-xl p-4 transition-all duration-300">
                  <p className="text-[#ffffff] text-sm mb-1" style={{ fontWeight: 600 }}>
                    Resources will appear here.
                  </p>
                  <p className="text-[#BFBFBF] text-xs" style={{ fontWeight: 500 }}>
                    After you click the button.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}