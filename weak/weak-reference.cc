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
using v8::Persistent;
using v8::WeakCallbackInfo;

namespace WeakReference
{
    class Container {
    public:
        Persistent<Object> Target;
        Persistent<Object> WeakReference;

        Container()
            : Target()
            , WeakReference()
        {
        }
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
        Container* pContainer = reinterpret_cast<Container*>(info.This()->GetAlignedPointerFromInternalField(WeakReferenceClassField::ContainerField));

        info.GetReturnValue().Set(Nan::New<Boolean>(pContainer->Target.IsEmpty()));
    }

    NAN_METHOD(Ref)
    {
        Container *pContainer = reinterpret_cast<Container*>(info.This()->GetAlignedPointerFromInternalField(WeakReferenceClassField::ContainerField));

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

        delete pContainer;
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

        pContainer->WeakReference.Reset(info.GetIsolate(), weakReference);
        pContainer->Target.Reset(info.GetIsolate(), target);

        weakReference->SetAlignedPointerInInternalField(WeakReferenceClassField::ContainerField, pContainer);

        pContainer->Target.SetWeak();
        pContainer->WeakReference.SetWeak(pContainer, WeakReferenceWeakCallback, v8::WeakCallbackType::kParameter);

        info.GetReturnValue().Set(weakReference);
    }

    NAN_MODULE_INIT(Initialize)
    {
        Nan::HandleScope scope;

        Local<ObjectTemplate> classHolder = Nan::New<ObjectTemplate>();

        Nan::SetMethod(classHolder, "isDead", IsDead);
        Nan::SetMethod(classHolder, "ref", Ref);

        classHolder->SetInternalFieldCount(WeakReferenceClassField::FieldCount);

        WeakReferenceClass.Reset(v8::Isolate::GetCurrent(), classHolder);

        Nan::Export(target, "create", Create);
    }

    NODE_MODULE(WeakReference, Initialize);
} // namespace WeakReference
