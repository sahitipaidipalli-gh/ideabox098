-- Insert sample ideas (no user required since created_by is nullable)
INSERT INTO public.ideas (title, description, category, usage_frequency, status) VALUES
  (
    'Dark Mode Support',
    'Add a dark mode toggle to reduce eye strain during nighttime usage. This would include a system preference detection and manual toggle option.',
    'UI/UX',
    'High',
    'Planned in Q4'
  ),
  (
    'Bulk Export Feature',
    'Allow users to export multiple records at once in CSV or Excel format. This would save time for users managing large datasets.',
    'Data Management',
    'High',
    'Under Review'
  ),
  (
    'Email Notifications',
    'Send email notifications when ideas are updated or commented on. Users should be able to customize notification preferences.',
    'Notifications',
    'Low',
    'Will be revisited later'
  ),
  (
    'Mobile App',
    'Develop native mobile applications for iOS and Android to access ideas on the go.',
    'Platform',
    'High',
    'Under Review'
  ),
  (
    'Advanced Filtering',
    'Add more filtering options including date ranges, multiple categories, and custom tags.',
    'Features',
    'High',
    'Development In Progress'
  ),
  (
    'Commenting System',
    'Allow users to comment on ideas to provide feedback and discuss implementation details.',
    'Collaboration',
    'Low',
    'Under Review'
  ),
  (
    'Integration with Slack',
    'Post new ideas and updates directly to Slack channels for better team visibility.',
    'Integrations',
    'Low',
    'Released'
  ),
  (
    'Keyboard Shortcuts',
    'Add keyboard shortcuts for common actions like submitting ideas, voting, and navigation.',
    'Productivity',
    'Low',
    'Under Review'
  )
ON CONFLICT DO NOTHING;