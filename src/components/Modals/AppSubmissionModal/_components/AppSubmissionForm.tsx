import React, { useState } from "react";
import { FormProvider, useFormContext, UseFormReturn } from "react-hook-form";
import {
  Button,
  InkIcon,
  Input,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@inkonchain/ink-kit";
import Image from "next/image";
import { z } from "zod";

import { FormState } from "@/actions/submit-your-app";
import { ImageIcon } from "@/components/icons/Image";
import {
  AppSubmissionFormData,
  appSubmissionSchema,
  CategoryValue,
  TagValue,
} from "@/schemas/app-submission-schema";

interface AppSubmissionFormProps {
  form: UseFormReturn<z.infer<typeof appSubmissionSchema>>;
  formAction: (payload: AppSubmissionFormData) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  state: FormState;
  disabled: boolean;
  isSubmitting: boolean;
}

export const AppSubmissionForm: React.FC<AppSubmissionFormProps> = ({
  form,
  formAction,
  onSubmit,
  state,
  disabled,
  isSubmitting,
}) => {
  return (
    <FormProvider {...form}>
      {state?.message !== "" && !state.issues && (
        <div className="ink:text-status-error">{state.message}</div>
      )}
      {state?.issues && (
        <div className="ink:text-status-error">
          <ul>
            {state.issues.map((issue, index) => (
              <li key={`error-${index}`} className="flex gap-1">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
      <form className="flex flex-col gap-8 w-full" onSubmit={onSubmit}>
        <InputField
          name="name"
          label="App Name"
          placeholder="e.g., Ink Super App"
          disabled={disabled}
          required
        />

        <InputField
          name="shortDescription"
          label="Description"
          placeholder="Brief description of your app..."
          disabled={disabled}
          required
        />

        <FileInput name="iconFile" label="Icon" disabled={disabled} required />

        <MultiSelectField<CategoryValue>
          name="categories"
          label="Categories"
          options={[
            { label: "Bridge", value: "Bridge" },
            { label: "DeFi", value: "DeFi" },
            { label: "Explorers", value: "Explorers" },
            { label: "Infra", value: "Infra" },
            { label: "On-ramps", value: "On-ramps" },
            { label: "Social", value: "Social" },
            { label: "Other", value: "Other" },
          ]}
          required
        />

        <SelectField
          name="network"
          label="Network"
          options={[
            { label: "Mainnet", value: "Mainnet" },
            { label: "Testnet", value: "Testnet" },
            { label: "Both", value: "Both" },
          ]}
          defaultValue={{ label: "Mainnet", value: "Mainnet" }}
          required
        />

        <MultiSelectField<TagValue>
          name="tags"
          label="Tags"
          options={[
            { label: "Cross Chain", value: "cross-chain" },
            { label: "Data", value: "data" },
            { label: "DEX", value: "dex" },
            { label: "Domain Names", value: "domain names" },
            { label: "Explorer", value: "explorer" },
            { label: "Faucet", value: "faucet" },
            { label: "Fun", value: "fun" },
            { label: "Funding", value: "funding" },
            { label: "Interop", value: "interop" },
            { label: "Lending", value: "lending" },
            { label: "NFTs", value: "nfts" },
            { label: "Oracle", value: "oracle" },
            { label: "RPC", value: "rpc" },
            { label: "Security", value: "security" },
            { label: "Tokens", value: "tokens" },
            { label: "Tools", value: "tools" },
            { label: "Wallet", value: "wallet" },
            { label: "Yield", value: "yield" },
          ]}
          required
        />

        <InputField
          name="mainnetWebsite"
          label="Mainnet Website"
          placeholder="https://..."
          disabled={disabled}
          required
        />

        <InputField
          name="testnetWebsite"
          label="Testnet Website (if different from mainnet)"
          placeholder="https://..."
          disabled={disabled}
        />

        <InputField
          name="x"
          label="X (Twitter)"
          placeholder="https://x.com/..."
          disabled={disabled}
        />

        <InputField
          name="discord"
          label="Discord"
          placeholder="https://discord.gg/..."
          disabled={disabled}
        />

        <InputField
          name="telegram"
          label="Telegram"
          placeholder="https://t.me/..."
          disabled={disabled}
        />

        <InputField
          name="github"
          label="GitHub"
          placeholder="https://github.com/..."
          disabled={disabled}
        />

        <InputField
          name="farcaster"
          label="Farcaster"
          placeholder="https://warpcast.com/..."
          disabled={disabled}
        />

        <InputField
          name="smartContractUrl"
          label="Smart Contract URL"
          placeholder="https://explorer.inkonchain.com/address/0x{...}"
          disabled={disabled}
        />

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </FormProvider>
  );
};

const SubmitButton: React.FC<{
  isSubmitting: boolean;
}> = ({ isSubmitting }) => (
  // Not using "disabled" property as it seems to mess up the scroll position when submitting...
  // TODO: Figure out root cause of this weird behavior
  <Button
    variant="primary"
    size="md"
    type="submit"
    disabled={isSubmitting}
    onClick={(e) => {
      if (isSubmitting) {
        e.preventDefault();
      }
    }}
  >
    {isSubmitting ? (
      <div className="flex items-center justify-center gap-3">
        <div className="ink:size-3">
          <InkIcon.Loading className="animate-spin" />
        </div>
        <span>Submitting...</span>
      </div>
    ) : (
      "Submit"
    )}
  </Button>
);

interface InputFieldProps {
  name: string;
  placeholder: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  placeholder,
  label,
  disabled,
  required = false,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold" htmlFor={name}>
        {label}
        {required && <span className="ink:text-status-error ml-0.5">*</span>}
      </label>
      <Input
        placeholder={placeholder}
        disabled={disabled}
        {...register(name)}
      />
      {errors[name] && (
        <span className="ink:text-status-error">
          {errors[name]?.message as string}
        </span>
      )}
    </div>
  );
};

const FileInput: React.FC<Omit<InputFieldProps, "placeholder">> = ({
  name,
  label,
  disabled,
  required = false,
}) => {
  const form = useFormContext();
  const [preview, setPreview] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const fileType = file.type;
      const validImageTypes = [
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (validImageTypes.includes(fileType)) {
        setPreview(file);
        form.setValue(name, file, { shouldValidate: true });
      } else {
        setPreview(null);
        form.setError(name, {
          type: "manual",
          message: "Only images (JPEG, PNG, GIF, WebP) are accepted",
        });
      }
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold" htmlFor={name}>
        {label}
        {required && <span className="ink:text-status-error ml-0.5">*</span>}
      </label>
      <div className="flex flex-col items-start">
        {preview ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                form.setValue(name, null);
              }}
              className="absolute -top-1 -right-1 bg-gray-200 hover:bg-gray-300 text-blackMagic rounded-full p-1 w-6 h-6 flex items-center justify-center text-sm focus:outline-(--ink-button-primary) transition-all duration-150"
            >
              <div className="ink:size-3">
                <InkIcon.Close />
              </div>
            </button>
            <Image
              className="h-20 w-20 rounded-md object-cover shadow-lg"
              src={URL.createObjectURL(preview)}
              alt="Preview"
              width={80}
              height={80}
            />
          </div>
        ) : (
          <div className="relative h-20 w-full items-center rounded-md hover:border-(--ink-button-primary) border-[1px] group transition-all duration-150">
            <input
              name={name}
              type="file"
              accept="image/*"
              disabled={disabled}
              onChange={handleFileChange}
              className="absolute inset-0 z-10 opacity-0 cursor-pointer box-border"
            />
            <div className="h-full w-full absolute z-1 flex justify-center items-center top-0 group-hover:text-(--ink-button-primary) transition-all duration-150">
              <div className="flex flex-col items-center gap-1">
                <ImageIcon
                  size="icon-xl"
                  enforce="inherit"
                  className="w-8 h-8"
                />
                <span className="text-sm">
                  Drag and drop or click to select
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {form.formState.errors[name] && (
        <span className="ink:text-status-error">
          {form.formState.errors[name]?.message as string}
        </span>
      )}
    </div>
  );
};

type SelectOption<T> = {
  label: string;
  value: T;
};

interface SelectFieldProps<T extends string> {
  name: string;
  label: string;
  options: SelectOption<T>[];
  defaultValue: SelectOption<T>;
  required?: boolean;
}

const SelectField = <T extends string>({
  name,
  label,
  options,
  defaultValue,
  required = false,
}: SelectFieldProps<T>) => {
  const { register, setValue } = useFormContext();
  const [selected, setSelected] = useState<SelectOption<T>>(defaultValue);

  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold" htmlFor={name}>
        {label}
        {required && <span className="ink:text-status-error ml-0.5">*</span>}
      </label>
      <input type="hidden" {...register(name)} value={selected.value} />
      <Listbox
        value={selected}
        onChange={(newValue: SelectOption<T>) => {
          setSelected(newValue);
          setValue(name, newValue.value);
        }}
      >
        <ListboxButton>{selected.label}</ListboxButton>
        <ListboxOptions className="z-10001 shadow-sm rounded-3xl">
          {options.map((option) => (
            <ListboxOption key={option.value} value={option}>
              {option.label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};

interface MultiSelectFieldProps<T extends string> {
  name: string;
  label: string;
  options: SelectOption<T>[];
  required?: boolean;
}

const MultiSelectField = <T extends string>({
  name,
  label,
  options,
  required = false,
}: MultiSelectFieldProps<T>) => {
  const { register, setValue } = useFormContext();
  const [selected, setSelected] = useState<SelectOption<T>[]>([]);

  return (
    <div className="flex flex-col gap-1">
      <label className="font-semibold" htmlFor={name}>
        {label}
        {required && <span className="ink:text-status-error ml-0.5">*</span>}
      </label>
      <Listbox
        multiple
        value={selected}
        onChange={(newValues: SelectOption<T>[]) => {
          setSelected(newValues);
          setValue(
            name,
            newValues.map((v) => v.value)
          );
        }}
      >
        <ListboxButton>
          {selected.length ? (
            <div className="flex items-center gap-1">
              {selected.map((item) => (
                <span
                  key={item.value}
                  className="ink:bg-background-container px-2 py-0.5 rounded-full text-sm"
                >
                  {item.label}
                </span>
              ))}
            </div>
          ) : (
            "Select options..."
          )}
        </ListboxButton>
        <ListboxOptions className="z-10001 shadow-sm rounded-3xl">
          {options.map((option) => (
            <ListboxOption key={option.value} value={option}>
              {option.label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};
