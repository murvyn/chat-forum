import { Notifications } from "@/types"
import moment from "moment"

export const getInitials = (firstName: string, lastName: string) => {
    if(!firstName || !lastName) {return ''}
    const firstInitial = firstName.charAt(0).toUpperCase()
    const lastInitial = lastName.charAt(0).toUpperCase()
    return `${firstInitial}${lastInitial}`
}

export const getFormattedTime = (createdAt: Date) => {
    const now = moment()
    const messageTime = moment(createdAt)
    const isRecent = now.diff(messageTime, 'hours') < 24

    return isRecent? messageTime.format('h:m A') : messageTime.format('d/m/y')
  }

export const unreadNotification = (notifications: Notifications[]) => {
    return notifications?.filter(n => n.isRead === false);
}