import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '../../constants/theme';

interface CustomCalendarProps {
  value?: Date | null;
  onChange: (date: Date) => void;
  onClose?: () => void;
}

export default function CustomCalendar({ value, onChange, onClose }: CustomCalendarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  
  const [viewMonth, setViewMonth] = useState(value || new Date());
  
  // Presets
  const datePresets = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [
      { label: "Hoy", date: new Date(today) },
      { label: "Mañana", date: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      { label: "En 3 días", date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) },
      { label: "En 7 días", date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) },
    ];
  }, []);

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Días del mes siguiente
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewMonth]);

  const handleDatePreset = (presetDate: Date) => {
    const newDate = new Date(presetDate);
    newDate.setHours(0, 0, 0, 0);
    onChange(newDate);
    setViewMonth(newDate);
  };

  const handleCalendarDayClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    onChange(newDate);
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (date: Date) => {
    if (!value) return false;
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Presets */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Fechas frecuentes</Text>
        <View style={styles.presetsGrid}>
          {datePresets.map((preset, idx) => {
            const selected = isSelectedDate(preset.date);
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.presetBtn,
                  { backgroundColor: theme.border },
                  selected && { backgroundColor: theme.primary, borderColor: theme.primary },
                  idx >= 2 && { marginTop: 8 } // Add margin to the second row manually to prevent overlap
                ]}
                onPress={() => handleDatePreset(preset.date)}
              >
                <Text style={[
                  styles.presetText,
                  { color: theme.textMuted },
                  selected && { color: '#FFFFFF' }
                ]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Calendario Mensual */}
      <View style={styles.calendarContainer}>
        {/* Encabezado Mes/Año */}
        <View style={styles.monthHeader}>
          <TouchableOpacity
            style={[styles.arrowBtn, { backgroundColor: theme.cardLight }]}
            onPress={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))}
          >
            <Ionicons name="chevron-back" size={16} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: theme.text }]}>
            {viewMonth.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
          </Text>
          <TouchableOpacity
            style={[styles.arrowBtn, { backgroundColor: theme.cardLight }]}
            onPress={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))}
          >
            <Ionicons name="chevron-forward" size={16} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Días de la semana */}
        <View style={styles.daysHeader}>
          {["D", "L", "M", "M", "J", "V", "S"].map((day, idx) => (
            <Text key={idx} style={[styles.dayHeaderText, { color: theme.textMuted }]}>
              {day}
            </Text>
          ))}
        </View>

        {/* Grilla de Días */}
        <View style={styles.daysGrid}>
          {calendarDays.map((day, idx) => {
            const disabled = isPastDate(day.date);
            const selected = isSelectedDate(day.date);
            const isTodayDate = isToday(day.date);

            return (
              <TouchableOpacity
                key={idx}
                disabled={disabled}
                onPress={() => handleCalendarDayClick(day.date)}
                style={[
                  styles.dayCell,
                  selected && { backgroundColor: theme.primary },
                  !selected && isTodayDate && { borderWidth: 1, borderColor: theme.primary },
                  !selected && !isTodayDate && day.isCurrentMonth && { backgroundColor: theme.cardLight },
                  !selected && !isTodayDate && !day.isCurrentMonth && { opacity: 0 } // Ocultar días de otros meses para limpiar
                ]}
              >
                {day.isCurrentMonth && (
                    <Text style={[
                    styles.dayText,
                    { color: theme.text },
                    disabled && { color: colorScheme === 'dark' ? '#475569' : '#D1D5DB' },
                    selected && { color: '#FFFFFF', fontWeight: 'bold' },
                    !selected && isTodayDate && { color: theme.primary, fontWeight: 'bold' }
                    ]}>
                    {day.date.getDate()}
                    </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Botón Cerrar (Opcional) */}
      {onClose && (
        <TouchableOpacity 
          style={[styles.closeBtn, { backgroundColor: theme.cardLight }]} 
          onPress={onClose}
        >
          <Text style={[styles.closeBtnText, { color: theme.text }]}>Cerrar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    width: '100%',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '500',
  },
  calendarContainer: {
    width: '100%',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  arrowBtn: {
    padding: 6,
    borderRadius: 6,
  },
  monthText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    flex: 1,
    textAlign: 'center',
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  dayCell: {
    width: '13%', 
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
