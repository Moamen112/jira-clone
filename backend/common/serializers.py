class UpdateChangedFieldsMixin:
    def update(self, instance, validated_data: dict):
        if not validated_data:
            return instance

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        stamps = [
            field.name for field in instance._meta.fields if getattr(field, "auto_now", False)
        ]
        instance.save(update_fields=[*validated_data, *stamps])
        return instance
