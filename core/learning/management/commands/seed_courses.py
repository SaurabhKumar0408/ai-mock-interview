from django.core.management.base import BaseCommand
from learning.models import Course, Topic


class Command(BaseCommand):
    help = 'Seed initial courses and topics'

    def handle(self, *args, **kwargs):
        # clear existing data
        Course.objects.all().delete()

        courses = [
            {
                'title': 'HR Interview Prep',
                'description': 'Master behavioral interviews with STAR method, common HR questions and communication tips.',
                'category': 'hr',
                'icon': '🤝',
                'order': 1,
                'topics': [
                    ('STAR Method', 'Learn the Situation Task Action Result framework'),
                    ('Tell Me About Yourself', 'Craft a perfect self introduction'),
                    ('Strengths and Weaknesses', 'How to answer honestly and strategically'),
                    ('Teamwork and Collaboration', 'Showcase your team player skills'),
                    ('Leadership and Initiative', 'Demonstrate leadership even without a title'),
                    ('Conflict Resolution', 'Handle workplace conflicts professionally'),
                    ('Career Goals', 'Talk about your future ambitions confidently'),
                    ('Why This Company', 'Research and articulate your motivation'),
                ]
            },
            {
                'title': 'DSA Fundamentals',
                'description': 'Master data structures and algorithms for technical interviews at top companies.',
                'category': 'dsa',
                'icon': '💻',
                'order': 2,
                'topics': [
                    ('Arrays and Strings', 'Core operations, two pointers and sliding window'),
                    ('Linked Lists', 'Singly, doubly linked lists and common patterns'),
                    ('Stacks and Queues', 'LIFO FIFO structures and their applications'),
                    ('Trees and Binary Search Trees', 'Tree traversals, BST operations'),
                    ('Graphs', 'BFS DFS and shortest path algorithms'),
                    ('Dynamic Programming', 'Memoization and bottom up approaches'),
                    ('Sorting and Searching', 'Common sorting algorithms and binary search'),
                    ('Time and Space Complexity', 'Big O notation and optimization'),
                ]
            },
            {
                'title': 'System Design Basics',
                'description': 'Learn to design scalable distributed systems for senior engineering interviews.',
                'category': 'system_design',
                'icon': '🏗️',
                'order': 3,
                'topics': [
                    ('Scalability Fundamentals', 'Horizontal vs vertical scaling'),
                    ('Load Balancing', 'Distribute traffic across servers'),
                    ('Caching Strategies', 'Redis, CDN and cache invalidation'),
                    ('Database Design', 'SQL vs NoSQL and when to use each'),
                    ('API Design', 'REST vs GraphQL best practices'),
                    ('Message Queues', 'Async communication with Kafka and RabbitMQ'),
                    ('Microservices', 'Breaking monoliths into services'),
                    ('Real World Systems', 'Design Twitter, YouTube, Uber'),
                ]
            },
            {
                'title': 'Domain Interview Prep',
                'description': 'Prepare for domain specific interviews in Finance, Marketing, Product and more.',
                'category': 'domain',
                'icon': '🎯',
                'order': 4,
                'topics': [
                    ('Finance Fundamentals', 'Key financial concepts for interviews'),
                    ('Marketing Basics', 'Core marketing principles and frameworks'),
                    ('Product Management', 'PM interview questions and frameworks'),
                    ('Business Analysis', 'Analytical thinking and case studies'),
                    ('Data Analytics', 'SQL, metrics and data driven decisions'),
                    ('Consulting Frameworks', 'MECE, issue trees and case interviews'),
                ]
            },
        ]

        for course_data in courses:
            topics_data = course_data.pop('topics')
            course = Course.objects.create(**course_data)

            for i, (title, description) in enumerate(topics_data, start=1):
                Topic.objects.create(
                    course=course,
                    title=title,
                    description=description,
                    order=i
                )
            self.stdout.write(f'✅ Created course: {course.title}')

        self.stdout.write(self.style.SUCCESS('🎉 All courses seeded successfully!'))