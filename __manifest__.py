# -*- coding: utf-8 -*-
{
    'name': "clinic_management",
    'summary': "Clinic Management Addon",
    'description': """CLinic Management Addon""",
    'author': "Mazen Khairy",
    'version': '0.1',
    'depends': ['base'],
    'category': 'Hospital',
    'data': [
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',
        'views/clinic_patient_views.xml',
        'views/clinic_doctor_views.xml',
        'views/clinic_appointments_views.xml'
    ],
    'demo': [
        'demo/demo.xml',
    ],
    'installable': True,
}

