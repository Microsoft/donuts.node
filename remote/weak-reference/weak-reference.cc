//-----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// Licensed under the MIT License. See License file under the project root for license information.
//-----------------------------------------------------------------------------

#include <stdlib.h>
#include <nan.h>

using v8::Boolean;
using v8::Function;
using v8::Local;
using v8::Value;
using v8::Object;
using v8::ObjectTemplate;
using Nan::Persistent;
using Nan::WeakCallbackInfo;
using Nan::Callback;

namespace WeakReference
{
	class Container {
	public:
		Persistent<Object> Target;
		Persistent<Function> WatcherCallback;
		Persistent<Object> WeakReference;
	};

	Persistent<ObjectTemplate> WeakReferenceClass;

	// Do NOT specify the value of enum as the last enum is used to count how many enums.
	enum WeakReferenceClassField : int
	{
		ContainerField,

		FieldCount // Has to be the last one.
	};

	/**
	 * WeakReferenceClass Methods Begin
	 */

	NAN_METHOD(IsDead)
	{
		Container* pContainer = reinterpret_cast<Container*>(Nan::GetInternalFieldPointer(info.This(), WeakReferenceClassField::ContainerField));

		info.GetReturnValue().Set(Nan::New<Boolean>(pContainer->Target.IsEmpty()));
	}

	NAN_METHOD(SetWatcher)
	{
		if (info.Length() > 0 || (!info[0]->IsFunction() && !info[0]->IsNullOrUndefined()))
		{
			if (!info[0]->IsFunction())
			{
				Nan::ThrowTypeError("target must be an object");
			}
		}

		Container *pContainer = reinterpret_cast<Container*>(Nan::GetInternalFieldPointer(info.This(), WeakReferenceClassField::ContainerField));

		if (info[0]->IsNullOrUndefined())
		{
			pContainer->WatcherCallback.Reset();
		}
		else
		{
			pContainer->WatcherCallback.Reset(info[0].As<Function>());
		}

		info.GetReturnValue().Set(info.This());
	}

	NAN_METHOD(Ref)
	{
		Container *pContainer = reinterpret_cast<Container*>(Nan::GetInternalFieldPointer(info.This(), WeakReferenceClassField::ContainerField));

		if (pContainer->Target.IsEmpty())
		{
			info.GetReturnValue().Set(Nan::Undefined());
		}
		else
		{
			info.GetReturnValue().Set(Nan::New(pContainer->Target));
		}
	}

	/**
	 * WeakReferenceClass Methods End
	 */

	void WeakReferenceWeakCallback(const WeakCallbackInfo<Container> &data)
	{
		Container *pContainer = data.GetParameter();

		if (!pContainer->WatcherCallback.IsEmpty()) {

			pContainer->WatcherCallback.Reset();
		}

		pContainer->Target.Reset();
		pContainer->WeakReference.Reset();

		delete pContainer;
	}

	void TargetWeakCallback(const WeakCallbackInfo<Container> &data)
	{
		Container *pContainer = data.GetParameter();

		pContainer->Target.Reset();

		if (!pContainer->WatcherCallback.IsEmpty()) {
			Callback watcherCallback(Nan::New<Function>(pContainer->WatcherCallback));
			Local<Value> argv[] = { Nan::New(pContainer->WeakReference) };

			Nan::Call(watcherCallback, 1, argv);

			pContainer->WatcherCallback.Reset();
		}
	}

	// Create an instance of WeakReferenceClass
	NAN_METHOD(Create)
	{
		if (info.Length() <= 0 || !info[0]->IsObject())
		{
			Nan::ThrowTypeError("target must be an object");
		}

		Local<Object> target = info[0].As<Object>();
		Container * pContainer = new Container();
		Local<Object> weakReference = Nan::New(WeakReferenceClass)->NewInstance();

		pContainer->WeakReference.Reset(weakReference);
		pContainer->Target.Reset(target);

		Nan::SetInternalFieldPointer(weakReference, WeakReferenceClassField::ContainerField, pContainer);

		pContainer->Target.SetWeak(pContainer, TargetWeakCallback, Nan::WeakCallbackType::kParameter);
		pContainer->WeakReference.SetWeak(pContainer, WeakReferenceWeakCallback, Nan::WeakCallbackType::kParameter);

		info.GetReturnValue().Set(weakReference);
	}

	NAN_MODULE_INIT(Initialize)
	{
		Nan::HandleScope scope;

		Local<ObjectTemplate> classHolder = Nan::New<ObjectTemplate>();

		Nan::SetMethod(classHolder, "isDead", IsDead);
		Nan::SetMethod(classHolder, "setWatcher", SetWatcher);
		Nan::SetMethod(classHolder, "ref", Ref);

		classHolder->SetInternalFieldCount(WeakReferenceClassField::FieldCount);

		WeakReferenceClass.Reset(classHolder);

		Nan::Export(target, "create", Create);
	}

	NODE_MODULE(WeakReference, Initialize);
} // namespace WeakReference
