# -*- coding: utf-8 -*-
{
    'name': "clinic_management",
    'summary': "Clinic Management Addon",
    'description': """CLinic Management Addon""",
    'author': "Mazen Khairy",
    'version': '0.1',
    'depends': ['base', 'product', 'mail', 'web'],
    'category': 'Hospital',
    'data': [
        'security/clinic_security.xml',
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',
        'views/clinic_patient_views.xml',
        'views/clinic_doctor_views.xml',
        'wizards/reschedule_wizard_views.xml',
        'views/clinic_appointments_views.xml',
        'views/product_views.xml',
        'reports/appointments_report.xml',
        'data/product_data.xml',
        'data/cron_jobs.xml',
    ],
    'demo': [
        'demo/demo.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'clinic_management/static/src/components/clinic_dashboard/clinic_dashboard.js',
            'clinic_management/static/src/components/clinic_dashboard/clinic_dashboard.xml',
            'clinic_management/static/src/components/clinic_kanban/clinic_kanban.js',
            'clinic_management/static/src/components/clinic_kanban/clinic_kanban.xml',
        ],
    },
    'installable': True,
}
