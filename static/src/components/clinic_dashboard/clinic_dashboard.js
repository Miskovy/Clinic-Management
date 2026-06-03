/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, onMounted, onWillUnmount, useState } from "@odoo/owl";
import { AppointmentModal } from "./appointment_modal";

export class ClinicDashboard extends Component {
    setup() {
        this.orm = useService("orm");
        this.state = useState({
            title: "Clinic Dashboard",
            isLoading: true,
            error: null,
            patientCount: 0,
            totalAppointments: 0,
            confirmedAppointments: 0,
            doneAppointments: 0,
            cancelledAppointments: 0,
            recentAppointments: [],
            confirmingAppointmentId: null,
            isModalOpen: false,
            notifications: [],
            unreadCount: 0,
            showNotificationsDropdown: false,
            readNotificationIds: {},
        });

        onMounted(() => {
            this.loadDashboardData();
            this.loadNotifications();
            this.notificationInterval = setInterval(() => {
                this.loadNotifications();
            }, 60000);
        });

        onWillUnmount(() => {
            if (this.notificationInterval) {
                clearInterval(this.notificationInterval);
            }
        });
    }

    openAppointmentModal() {
        this.state.isModalOpen = true;
    }

    closeAppointmentModal() {
        this.state.isModalOpen = false;
    }

    async loadDashboardData() {
        this.state.isLoading = true;
        this.state.error = null;

        try {
            const [
                patientCount,
                totalAppointments,
                confirmedAppointments,
                doneAppointments,
                cancelledAppointments,
                recentAppointments,
            ] = await Promise.all([
                this.orm.searchCount("clinic.patient", []),
                this.orm.searchCount("clinic.appointment", []),
                this.orm.searchCount("clinic.appointment", [["state", "=", "confirmed"]]),
                this.orm.searchCount("clinic.appointment", [["state", "=", "done"]]),
                this.orm.searchCount("clinic.appointment", [["state", "=", "cancelled"]]),
                this.orm.searchRead(
                    "clinic.appointment",
                    [],
                    ["name", "patient_id", "doctor_id", "appointment_date", "state"],
                    { limit: 5, order: "appointment_date desc" }
                ),
            ]);

            this.state.patientCount = patientCount;
            this.state.totalAppointments = totalAppointments;
            this.state.confirmedAppointments = confirmedAppointments;
            this.state.doneAppointments = doneAppointments;
            this.state.cancelledAppointments = cancelledAppointments;
            this.state.recentAppointments = recentAppointments;
        } catch (error) {
            console.error("Failed to load clinic dashboard data", error);
            this.state.error = "Could not load dashboard data.";
        } finally {
            this.state.isLoading = false;
        }
    }

    async confirmAppointment(appointmentId) {
        this.state.confirmingAppointmentId = appointmentId;
        this.state.error = null;

        try {
            await this.orm.call("clinic.appointment", "action_confirm", [[appointmentId]]);
            await this.loadDashboardData();
        } catch (error) {
            console.error("Failed to confirm clinic appointment", error);
            this.state.error = "Could not confirm the appointment.";
        } finally {
            this.state.confirmingAppointmentId = null;
        }
    }

    async loadNotifications() {
        const now = new Date();
        const twoHoursLater = new Date(Date.now() + 2 * 60 * 60 * 1000);
        
        const pad = (num) => String(num).padStart(2, '0');
        const formatUtc = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
        
        const nowStr = formatUtc(now);
        const twoHoursLaterStr = formatUtc(twoHoursLater);

        try {
            const appointments = await this.orm.searchRead(
                "clinic.appointment",
                [
                    ["state", "=", "confirmed"],
                    ["appointment_date", ">=", nowStr],
                    ["appointment_date", "<=", twoHoursLaterStr],
                ],
                ["name", "patient_id", "doctor_id", "appointment_date"]
            );

            const updatedNotifications = appointments.map(appt => {
                const apptDate = new Date(appt.appointment_date + "Z");
                const diffMs = apptDate.getTime() - Date.now();
                const diffMins = Math.max(0, Math.floor(diffMs / (60 * 1000)));
                const remainingStr = diffMins > 0 ? `${diffMins} min remaining` : "starting now";
                return {
                    ...appt,
                    remainingStr,
                };
            });

            this.state.notifications = updatedNotifications;
            const unread = updatedNotifications.filter(n => !this.state.readNotificationIds[n.id]);
            this.state.unreadCount = unread.length;
        } catch (error) {
            console.error("Failed to load notifications:", error);
        }
    }

    toggleNotificationsDropdown() {
        this.state.showNotificationsDropdown = !this.state.showNotificationsDropdown;
    }

    markAllRead() {
        for (const n of this.state.notifications) {
            this.state.readNotificationIds[n.id] = true;
        }
        this.state.unreadCount = 0;
    }
}

ClinicDashboard.components = { AppointmentModal };
ClinicDashboard.template = "clinic_management.ClinicDashboard";

registry.category("actions").add("clinic_dashboard", ClinicDashboard);
